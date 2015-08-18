
var runtests = function(aTestData)
{
    var results = []

    for (var ltestData of aTestData["tests"])
    {
        var ltest = [
            ltestData[0],
            aTestData["sources"][ltestData[1]] || null,
            aTestData["transforms"][ltestData[2]] || null,
            aTestData["sources"][ltestData[3]] || null
        ]
        results = runtest(results, ltest);
    }

    return results
}


var runtest = function(results, testargs)
{
    var retval = []

    retval = retval = retval = retval.concat(testargs)

    var lresult = transform(testargs[1], testargs[2])

    retval = retval.concat([lresult])
    retval = retval.concat([deepEqual(lresult, testargs[3], 100)])

    return results.concat([retval])
}



var deepEqual = function(aMAS1, aMAS2, maxdepth)
{
    var retval = false;

    if (maxdepth)
    {
        retval = 
            (isObject(aMAS1) && isObject(aMAS2)) ||
            (isArray(aMAS1) && isArray(aMAS2)) ||
            (
             !(isObject(aMAS1)) || (isArray(aMAS1)) &&
             !(isObject(aMAS2)) || (isArray(aMAS2)) 
            );
        
        if (retval)
        {
            if (isObject(aMAS1))
            {
                retval = getKeys(aMAS1).length == getKeys(aMAS2).length;
                if (retval)
                {
                    for (var lkey in aMAS1)
                    {
                        retval = (lkey in aMAS2) && deepEqual(aMAS1[lkey], aMAS2[lkey], maxdepth-1);
                        if (!retval)
                            break;
                    }
                }
            }
            else if (isArray(aMAS1))
            {
                retval = aMAS1.length == aMAS2.length;
                if (retval)
                {
                    var lindex = 0;
                    for (var litem of aMAS1)
                    {
                        retval = deepEqual(litem, aMAS2[lindex], maxdepth-1);
                        if (!retval)
                            break;
                        lindex += 1;
                    }
                }
            }
            else retval = aMAS1 == aMAS2
        }
    }

    return retval;
}


function isObject(obj) {
  return !isArray(obj) && obj === Object(obj);
}

function isArray(obj) {
  return Array.isArray(obj)
}

var getKeys = function(obj){
    var keys = [];
    for(var k in obj) keys.push(k);
    return keys;
}

