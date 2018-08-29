import general from './general'
import space from './space'

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}

export default {
  ...general,
  ...space
}