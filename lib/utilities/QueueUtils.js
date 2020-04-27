import Config from '../data/Config.js'

export default class QueueUtils {
  static queue ({
    log = Config.verbose,
    pad = { start: '', end: '...' },
    sync = true,
    numbered = false,
    tasks = []
  }) {
    if (!pad.hasOwnProperty('start')) {
      pad.start = ''
    }

    if (!pad.hasOwnProperty('end')) {
      pad.end = '...'
    }

    return new Promise((resolve, reject) => {
      let queue = new NGN.Tasks()

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
        let name = task.name
        let number = `${index + 1}. `

        queue.add(`${numbered ? number : ''}${task.name}`, next => {
          task.callback(next, ' '.repeat(number.length + NGN.coalesce(pad.start, '').length))
        })
      })

      queue.run(sync)
    })
  }
}
