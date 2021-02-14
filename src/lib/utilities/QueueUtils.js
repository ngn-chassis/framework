import { CONFIG } from '../../index.js'

export default class QueueUtils {
  static run ({
    log = CONFIG.verbose,
    pad = { start: '', end: '...' },
    sync = true,
    numbered = false,
    tasks = []
  }) {
    if (!Reflect.has(pad, 'start')) {
      pad.start = ''
    }

    if (!Reflect.has(pad, 'end')) {
      pad.end = '...'
    }

    return new Promise((resolve, reject) => {
      const queue = new NGN.Tasks()

      if (log) {
        queue.on('taskstart', task => console.log(`${NGN.coalesce(pad.start, '')}${task.name}${NGN.coalesce(pad.end, '')}`))
      }

      queue.on('complete', () => {
        if (log) {
          console.log('')
        }

        resolve()
      })

      if (tasks.length === 0) {
        return resolve()
      }

      tasks.forEach((task, index) => {
        const number = `${index + 1}. `

        queue.add(`${numbered ? number : ''}${task.name}`, next => {
          task.callback(next, ' '.repeat(number.length + NGN.coalesce(pad.start, '').length))
        })
      })

      queue.run(sync)
    })
  }
}
