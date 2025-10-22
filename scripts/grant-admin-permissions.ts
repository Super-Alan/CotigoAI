/**
 * Script to grant admin permissions to a user
 *
 * Usage:
 * tsx scripts/grant-admin-permissions.ts <user-email>
 *
 * Example:
 * tsx scripts/grant-admin-permissions.ts user@example.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function grantAdminPermissions(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User not found with email: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`)

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    })

    if (existingAdmin) {
      console.log(`📝 Updating existing admin permissions...`)

      // Update permissions
      const updated = await prisma.adminUser.update({
        where: { userId: user.id },
        data: {
          role: 'CONTENT_ADMIN',
          permissions: ['CONTENT_MANAGEMENT', 'USER_MANAGEMENT', 'ANALYTICS_VIEW'],
          isActive: true
        }
      })

      console.log(`✅ Admin permissions updated successfully!`)
      console.log(`   Role: ${updated.role}`)
      console.log(`   Permissions: ${JSON.stringify(updated.permissions)}`)
      console.log(`   Active: ${updated.isActive}`)
    } else {
      console.log(`🆕 Creating new admin user...`)

      // Create new admin user
      const newAdmin = await prisma.adminUser.create({
        data: {
          userId: user.id,
          role: 'CONTENT_ADMIN',
          permissions: ['CONTENT_MANAGEMENT', 'USER_MANAGEMENT', 'ANALYTICS_VIEW'],
          isActive: true
        }
      })

      console.log(`✅ Admin user created successfully!`)
      console.log(`   ID: ${newAdmin.id}`)
      console.log(`   Role: ${newAdmin.role}`)
      console.log(`   Permissions: ${JSON.stringify(newAdmin.permissions)}`)
    }

    console.log(`\n🎉 ${user.name} now has admin access to Content Management!`)
  } catch (error) {
    console.error('❌ Error granting admin permissions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide a user email')
  console.log('\nUsage: tsx scripts/grant-admin-permissions.ts <user-email>')
  console.log('Example: tsx scripts/grant-admin-permissions.ts user@example.com')
  process.exit(1)
}

grantAdminPermissions(email)
