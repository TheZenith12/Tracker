import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import * as express from 'express'
import { configure as serverlessExpress } from '@vendia/serverless-express'
import { VercelRequest, VercelResponse } from '@vercel/node'

let server: any

async function bootstrap() {
  const expressApp = express()
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), { logger: false })
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: process.env.APP_URL || '*', credentials: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.init()
  return serverlessExpress({ app: expressApp })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  server = server ?? (await bootstrap())
  return server(req, res)
}
