import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimeTrackingOptions {
  autoStart?: boolean
  onTick?: (elapsedSeconds: number) => void
}

interface UseTimeTrackingReturn {
  elapsedSeconds: number
  isTracking: boolean
  startTracking: () => void
  pauseTracking: () => void
  resetTracking: () => void
  getElapsedTime: () => number
}

/**
 * 通用时长追踪Hook
 *
 * @example
 * const { elapsedSeconds, startTracking, pauseTracking, getElapsedTime } = useTimeTracking()
 *
 * // 组件挂载时自动开始追踪
 * const tracking = useTimeTracking({ autoStart: true })
 *
 * // 提交时获取时长
 * const handleSubmit = async () => {
 *   const timeSpent = tracking.getElapsedTime()
 *   await fetch('/api/sessions', {
 *     method: 'POST',
 *     body: JSON.stringify({ timeSpent })
 *   })
 * }
 */
export function useTimeTracking(options: UseTimeTrackingOptions = {}): UseTimeTrackingReturn {
  const { autoStart = false, onTick } = options

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isTracking, setIsTracking] = useState(autoStart)

  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 开始追踪
  const startTracking = useCallback(() => {
    if (!isTracking) {
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000
      setIsTracking(true)
    }
  }, [isTracking])

  // 暂停追踪
  const pauseTracking = useCallback(() => {
    if (isTracking) {
      pausedTimeRef.current = elapsedSeconds
      setIsTracking(false)
    }
  }, [isTracking, elapsedSeconds])

  // 重置追踪
  const resetTracking = useCallback(() => {
    startTimeRef.current = null
    pausedTimeRef.current = 0
    setElapsedSeconds(0)
    setIsTracking(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // 获取当前已用时间(秒)
  const getElapsedTime = useCallback(() => {
    if (isTracking && startTimeRef.current) {
      return Math.floor((Date.now() - startTimeRef.current) / 1000)
    }
    return pausedTimeRef.current
  }, [isTracking])

  // 定时更新已用时间
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setElapsedSeconds(elapsed)
          onTick?.(elapsed)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTracking, onTick])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    elapsedSeconds,
    isTracking,
    startTracking,
    pauseTracking,
    resetTracking,
    getElapsedTime
  }
}

/**
 * 格式化时长显示
 * @param seconds 秒数
 * @returns 格式化后的时长字符串 (HH:MM:SS 或 MM:SS)
 */
export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
