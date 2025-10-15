const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // First, delete any existing admin user to ensure clean state
    await prisma.user.deleteMany({
      where: { email: 'admin@cogito.ai' }
    })
    
    console.log('Deleted any existing admin user')
    
    // Create fresh admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@cogito.ai',
        name: 'Admin User',
        password: hashedPassword,
      },
    })

    console.log('Admin user created successfully!')
    console.log('Email: admin@cogito.ai')
    console.log('Password: admin123')
    console.log('User ID:', user.id)
    
    // Verify the user was created correctly
    const verifyUser = await prisma.user.findUnique({
      where: { email: 'admin@cogito.ai' }
    })
    
    console.log('Verification - User found:', !!verifyUser)
    console.log('Verification - Has password:', !!verifyUser?.password)
    console.log('Verification - Password length:', verifyUser?.password?.length || 0)
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()