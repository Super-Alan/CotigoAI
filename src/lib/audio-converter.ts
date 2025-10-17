/**
 * 音频格式转换工具
 * 将 MediaRecorder 录制的 WebM/Opus 格式转换为 WAV/PCM 格式
 */

/**
 * 将音频 Blob 转换为 WAV 格式（16kHz, 16-bit, 单声道 PCM）
 *
 * @param audioBlob - MediaRecorder 录制的音频 Blob（通常是 audio/webm）
 * @param targetSampleRate - 目标采样率（默认 16000Hz）
 * @returns WAV 格式的 Blob
 */
export async function convertToWAV(
  audioBlob: Blob,
  targetSampleRate: number = 16000
): Promise<Blob> {
  try {
    // 1. 创建 AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass({ sampleRate: targetSampleRate });

    // 2. 将 Blob 转换为 ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // 3. 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // 4. 重采样到目标采样率（如果需要）
    let resampledBuffer = audioBuffer;
    if (audioBuffer.sampleRate !== targetSampleRate) {
      const offlineContext = new OfflineAudioContext(
        1, // 单声道
        Math.ceil(audioBuffer.duration * targetSampleRate),
        targetSampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      resampledBuffer = await offlineContext.startRendering();
    }

    // 5. 提取单声道 PCM 数据
    const pcmData = resampledBuffer.getChannelData(0);

    // 6. 转换为 16-bit PCM
    const pcm16 = new Int16Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // 7. 创建 WAV 文件头
    const wavHeader = createWAVHeader(pcm16.length * 2, targetSampleRate, 1, 16);

    // 8. 合并 WAV 头和 PCM 数据
    const wavBlob = new Blob([wavHeader, pcm16], { type: 'audio/wav' });

    // 关闭 AudioContext
    await audioContext.close();

    return wavBlob;
  } catch (error) {
    console.error('[Audio Converter] 转换失败:', error);
    throw new Error(`音频格式转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 创建 WAV 文件头
 *
 * @param dataSize - PCM 数据大小（字节）
 * @param sampleRate - 采样率
 * @param numChannels - 声道数
 * @param bitsPerSample - 采样位深
 * @returns WAV 文件头 ArrayBuffer
 */
function createWAVHeader(
  dataSize: number,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
  view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true); // Subchunk2Size

  return header;
}

/**
 * 在 DataView 中写入字符串
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * 从 WAV Blob 中提取纯 PCM 数据（去除 WAV 头）
 *
 * @param wavBlob - WAV 格式的 Blob
 * @returns 纯 PCM 数据的 ArrayBuffer
 */
export async function extractPCMFromWAV(wavBlob: Blob): Promise<ArrayBuffer> {
  const arrayBuffer = await wavBlob.arrayBuffer();
  const view = new DataView(arrayBuffer);

  // 验证 RIFF 头
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') {
    throw new Error('不是有效的 WAV 文件');
  }

  // 查找 data chunk
  let offset = 12; // 跳过 RIFF header
  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'data') {
      // 找到 data chunk，返回 PCM 数据
      const pcmData = arrayBuffer.slice(offset + 8, offset + 8 + chunkSize);
      console.log('[Audio Converter] PCM 数据提取完成:', {
        totalSize: arrayBuffer.byteLength,
        headerSize: offset + 8,
        pcmSize: pcmData.byteLength
      });
      return pcmData;
    }

    offset += 8 + chunkSize;
  }

  throw new Error('WAV 文件中未找到 data chunk');
}

/**
 * 验证音频格式信息
 */
export function validateAudioFormat(format: {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
}): boolean {
  const { sampleRate = 16000, channels = 1, bitDepth = 16 } = format;

  // Volcengine ASR 支持的格式
  const validSampleRates = [8000, 16000, 24000, 32000, 44100, 48000];
  const validChannels = [1, 2];
  const validBitDepths = [16];

  return (
    validSampleRates.includes(sampleRate) &&
    validChannels.includes(channels) &&
    validBitDepths.includes(bitDepth)
  );
}
