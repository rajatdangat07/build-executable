import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const nameToGreet = core.getInput('who-to-greet')
    core.info(`Hello ${nameToGreet}`)
    const time = new Date().toTimeString()
    core.setOutput('time', time)

    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.info(`The event payload: ${payload}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
