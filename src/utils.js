export function eachFn(array, iterator) {
  let i = 0
  if (!array || !array.length) {
    return []
  }
  for (i = 0; i < array.length; i++) {
    iterator(array[i], i)
  }
}

function eachTimesFn(count, iterator) {
  if (!count) {
    return []
  }
  for (var i = 0; i < count; i++) {
    iterator(i)
  }
}

export function mapTimesFn(count, iterator) {
  let result = []
  eachTimesFn(count, function (i) {
    result.push(iterator(i))
  })
  return result
}

/**
 * Noop function
 */
export function noop() {}
