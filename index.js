var Transform = require('stream').Transform
  , util      = require('util')

util.inherits(Stream, Transform)

const fields     = [ 'ns', 'total' , 'read' , 'write' ]
    , lockFields = [ 'db', 'total' , 'read' , 'write' ]

function parse(data, opts) {
  var collections = []
    , keys = []

  opts = opts || {}
  keys = opts.locks ? lockFields : fields

  data.split('\n').filter(function(d) {
    //If we're not displaying ms, we're not displaying stats
    return !!d && d.match(/\d+ms/)
  }).map(function(d) {
    return d.replace(/^\s+/, '').replace(/\s+/g, '|')
  }).forEach(function(d) {
    var collection = {}

    d.split('|').forEach(function(stat, index) {
      collection[keys[index]] = stat
    })

    collections.push(collection)
  })

  return collections
}
function Stream(opts) {
  if(!(this instanceof Stream))
    return new Stream(opts)

  opts = opts || {}
  opts.decodeStrings = false
  opts.objectMode = true
  this._locks = opts.locks ? true : false

  Transform.call(this, opts)

}

Stream.prototype._transform = function(data, encoding, cb) {
  parse(data, {locks: this._locks}).forEach(function(d){
    this.push(d)
  }, this)
  cb()
}

module.exports = {parse: parse, stream: Stream}
