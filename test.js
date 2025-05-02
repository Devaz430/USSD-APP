const removeArrayItem = (arr, itemToRemove) => {
  return arr.filter(item => item !== itemToRemove)
}
const items = ['orange', 'purple', 'orange', 'brown', 'red', 'orange']
removeArrayItem(items, 'orange')


 a = new Set([1,2,3,4,5])
a.delete(3)
console.log([...a])
