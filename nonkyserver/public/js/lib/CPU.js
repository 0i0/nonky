define(function (require) {
  var CPU = {}
  CPU.cacluateAvgUse = function(data){
    var samples = []
    var samplesNumber = data.length 
    // format data so its by core
    for (var core = 0; core<data[0].length;core++) {
      samples.push({total:[]})
      for(var key in data[0][core].times){
        samples[core][key] = []
      }
      for (var i = 0; i<data.length;i++) {
        var total = 0
        for(key in data[0][core].times){
          samples[core][key].push(data[i][core].times[key])
          total += data[i][core].times[key]
        }
        samples[core].total.push(total)
      }   
    }
    // calculat usage diffs
    for (core = 0; core<samples.length;core++) {
      for(key in samples[core]){
        samples[core][key+'Diff'] =[]
        for (var sample = 1; sample < samplesNumber ; sample++) {
          samples[core][key+'Diff'].push(samples[core][key][sample]-samples[core][key][sample-1])
        }
      }
      samples[core].usageDiff = []
      samples[core].usageSum = 0
      for(var diff=0;diff<samples[core].totalDiff.length;diff++){
        // usage is user + sys / total
        var usage = (samples[core]['userDiff'][diff]+samples[core]['sysDiff'][diff])
          / samples[core]['totalDiff'][diff]
        samples[core].usageSum += usage
        samples[core].usageDiff.push(usage)
      }
      samples[core].avg = samples[core].usageSum/samples[core].totalDiff.length
    }  
    return samples
  }
  return CPU
})