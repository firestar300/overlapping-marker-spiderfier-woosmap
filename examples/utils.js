/**
 * Debounce function
 *
 * @param {Function} callback
 * @param {Number} delay
 *
 * @returns {Function}
 */
export const debounce = (callback, delay) => {
  let timer
  return function () {
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}
