import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'

let cachedApp: any

async function bootstrap() {
  if (cachedApp) return cachedApp
  try {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
    app.setGlobalPrefix('api/v1')
    const allowedOrigins = [
      process.env.APP_URL,
      'https://tracker-eosin-eta.vercel.app',
      'http://localhost:3000',
    ].filter(Boolean)
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(null, false)
        }
      },
      credentials: true,
    })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
    cachedApp = app.getHttpAdapter().getInstance()
  } catch (err) {
    console.error('Bootstrap error:', err)
    throw err
  }
  return cachedApp
}

export default async (req: any, res: any) => {
  try {
    const app = await bootstrap()
    app(req, res)
  } catch (err) {
    console.error('Handler error:', err)
    res.status(500).json({ message: 'Internal server error', error: String(err) })
  }
}
