var transform = function(aMASSource, abOTLTransform)
{
    //bOTL transform external method
    var retval;

    var lscope = {
        "$": aMASSource,
        "@": aMASSource
    }
    
    var lresults = _transform(lscope, abOTLTransform)
    
    if (lresults["results"].length)
        retval = lresults["results"][0]
    else
        retval = null;

    return retval
}
    
var _transform = function(aScope, abOTLTransform)
{
    //transform using populated scope

    var lsectionF = GetSectionFunction(abOTLTransform)
    
    var lresultsAndKeepNulls = lsectionF(aScope)

    return lresultsAndKeepNulls;
}
        
var GetSectionFunction = function(abOTLTransform)
{
    //return the correct section function to use on the top level of this transform 
    //
    //Section functions take a scope and return a pair of (results list, keep-nulls).
    //
    //Note the real functions also take a bOTL transform, which is partially applied
    //using a lambda.

    var lfunction = null;

    if (isObject(abOTLTransform))
    {
        // got a dict
        if ("_type" in abOTLTransform)
        {
            var ltype = abOTLTransform["_type"];
            if (ltype == "#")
                lfunction = function (aScope) { return EvaluateFullSection(aScope, abOTLTransform) } 
            else if (ltype == "object")
                lfunction = function (aScope) { return EvaluateObjectSection(aScope, abOTLTransform) }
            else if (ltype == "literal")
                lfunction = function (aScope) { return EvaluateLiteralSection(aScope, abOTLTransform) }
            else
                lfunction = function (aScope) { return EvaluateObject(aScope, abOTLTransform) }
        }
        else
            lfunction = function (aScope) { return EvaluateObject(aScope, abOTLTransform) }
    }
    else if (isArray(abOTLTransform))
    {
        lfunction = function (aScope) { return EvaluateList(aScope, abOTLTransform) }
    }
    else if (isString(abOTLTransform))
    {
        if (abOTLTransform.slice(0,1) == "#")
            lfunction = function (aScope) { return EvaluateFullSection(aScope, {"_type": "#", "path": abOTLTransform.slice(1)}) };
        else
            lfunction = function (aScope) { return EvaluateLiteral(abOTLTransform) }
    }
    else
    {
        lfunction = function (aScope) { return EvaluateLiteral(abOTLTransform) }
    }
        
    return lfunction
}

// Evaluate functions must return 
// {"results": <a list of results>, "keepnulls": <boolean>}

var EvaluateLiteral = function(abOTLLiteral)
{
    return {"results": [abOTLLiteral], "keepnulls": true};
}

var EvaluateFullSection = function(aScope, abOTLSection)
{
    var lpath = abOTLSection["path"] || "@";
    var lscopeid = abOTLSection["scope"] || null;
    var lhastransform = "transform" in abOTLSection;
    var ltransform = abOTLSection["transform"] || null
    var lhasnulltransform = "nulltransform" in abOTLSection;
    var lnulltransform = abOTLSection["nulltransform"] || null;
    var lkeepnulls = "nulls" in abOTLSection ? abOTLSection["nulls"] : true;
    
    //1: Evaluate the path
    var lscope;
    if (lpath.slice(0,1) == "$")
        // this is a bit of a hack. I'd like to be able to tell jsonpath to use the attribute "$" as the root,
        // but the library doesn't support that.
        lscope = aScope["$"];
    else
        lscope = aScope;

    var lselections = jsonPath(lscope, lpath);
//     except Exception, ex:
//         raise Exception("Failed to parse '%s': %s" % (lpath, repr(ex)))

    var lresults = []
        
    if (isArray(lselections) && lselections.length)
    {
        // here we've got some results
        if (lhastransform)
        {
            // need to transform all items in selection
            lselections.forEach(function(aSelection){
                // set up scope for transform, store 
                // settings for restoration afterwards
                var lprev_at = aScope["@"]
                var lprev_scopeid;
                aScope["@"] = aSelection;
                if (lscopeid)
                {
                    lprev_scopeid = aScope[lscopeid]
                    aScope[lscopeid] = aSelection
                }
                
                var lchildResults = _transform(aScope, ltransform);

                lresults = lresults.concat(lchildResults["results"])
                
                // now restore the scope
                aScope["@"] = lprev_at
                if (lscopeid)
                    aScope[lscopeid] = lprev_scopeid
            })
        }
        else
            lresults = lselections
    }
    else
    {
        // here we've got no results
        if (lhasnulltransform)
            lresults = _transform(aScope, lnulltransform)["results"]
        else
            lresults = []
    }            
    
    if (!lkeepnulls)
    {
        var lfiltered = []

        lresults.forEach(function(aResult){
            if (aResult != null)
                lfiltered = lfiltered.concat([aResult])
        })
             
        lresults = lfiltered
    }
        
    return {"results": lresults, "keepnulls": lkeepnulls}
}

var EvaluateObjectSection = function(aScope, abOTLObjectSection)
{
    var retval = {"results": null, "keepnulls": true}

    var lvalue = abOTLObjectSection["value"] || null;

    if (isObject(lvalue))
    {
        lresult = {}
        for (var lkey in lvalue)
        {
            if (lkey == "_type")
                litem = lvalue[lkey]
            else
            {   
                lchildResults = _transform(aScope, lvalue[lkey]);
                if (lchildResults["results"].length)
                    litem = lchildResults["results"][0]
                else
                    litem = null;
            }

            if (litem != null || lkeepnulls)
                lresult[lkey] = litem
        }

        retval = {"results": [lresult], "keepnulls": true }
    }
        
    return retval;
}

var EvaluateLiteralSection = function(aScope, abOTLObjectSection)
{
    return { "results": [abOTLObjectSection["value"] != null ? abOTLObjectSection["value"] : null], "keepnulls": true }
}

var EvaluateObject = function (aScope, abOTLObject)
{
    var ltransformedObject = {}
    for (var lkey in abOTLObject)
    {
        ltransformedValue = _transform(aScope, abOTLObject[lkey]);

        if (ltransformedValue["results"].length || ltransformedValue["keepnulls"])
        {
            ltransformedObject[lkey] = ltransformedValue["results"].length ? ltransformedValue["results"][0] : null;
        }
    }
    
    return {"results": [ltransformedObject], "keepnulls": true}
}

var EvaluateList = function(aScope, abOTLList)
{
    var lresults = [];
    abOTLList.forEach(function(aItem){
        var lresult = _transform(aScope, aItem)
        lresults = lresults.concat(lresult["results"])
    })
    return {"results": [lresults], "keepnulls": true}
}

function isObject(obj) {
  return !isArray(obj) && obj === Object(obj);
}

function isArray(obj) {
  return Array.isArray(obj)
}

function isString(obj) {
  return (typeof obj === 'string' || obj instanceof String);
}

/* JSONPath 0.8.5 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 *
 * Proposal of Chris Zyp goes into version 0.9.x
 * Issue 7 resolved
 */
function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      result: [],
      normalize: function(expr) {
         var subx = [];
         return expr.replace(/[\['](\??\(.*?\))[\]']|\['(.*?)'\]/g, function($0,$1,$2){return "[#"+(subx.push($1||$2)-1)+"]";})  /* http://code.google.com/p/jsonpath/issues/detail?id=4 */
                    .replace(/'?\.'?|\['?/g, ";")
                    .replace(/;;;|;;/g, ";..;")
                    .replace(/;$|'?\]|'$/g, "")
                    .replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
      },
      asPath: function(path) {
         var x = path.split(";"), p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      store: function(p, v) {
         if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
         return !!p;
      },
      trace: function(expr, val, path) {
         if (expr !== "") {
            var x = expr.split(";"), loc = x.shift();
            x = x.join(";");
            if (val && val.hasOwnProperty(loc))
               P.trace(x, val[loc], path + ";" + loc);
            else if (loc === "*")
               P.walk(loc, x, val, path, function(m,l,x,v,p) { P.trace(m+";"+x,v,p); });
            else if (loc === "..") {
               P.trace(x, val, path);
               P.walk(loc, x, val, path, function(m,l,x,v,p) { typeof v[m] === "object" && P.trace("..;"+x,v[m],p+";"+m); });
            }
            else if (/^\(.*?\)$/.test(loc)) // [(expr)]
               P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";")+1))+";"+x, val, path);
            else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
               P.walk(loc, x, val, path, function(m,l,x,v,p) { if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"), v instanceof Array ? v[m] : v, m)) P.trace(m+";"+x,v,p); }); // issue 5 resolved
            else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
               P.slice(loc, x, val, path);
            else if (/,/.test(loc)) { // [name1,name2,...]
               for (var s=loc.split(/'?,'?/),i=0,n=s.length; i<n; i++)
                  P.trace(s[i]+";"+x, val, path);
            }
         }
         else
            P.store(path, val);
      },
      walk: function(loc, expr, val, path, f) {
         if (val instanceof Array) {
            for (var i=0,n=val.length; i<n; i++)
               if (i in val)
                  f(i,loc,expr,val,path);
         }
         else if (typeof val === "object") {
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m,loc,expr,val,path);
         }
      },
      slice: function(loc, expr, val, path) {
         if (val instanceof Array) {
            var len=val.length, start=0, end=len, step=1;
            loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0,$1,$2,$3){start=parseInt($1||start);end=parseInt($2||end);step=parseInt($3||step);});
            start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
            end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
            for (var i=start; i<end; i+=step)
               P.trace(i+";"+expr, val, path);
         }
      },
      eval: function(x, _v, _vname) {
         try { return $ && _v && eval(x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@")); }  // issue 7 : resolved ..
         catch(e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@")); }  // issue 7 : resolved ..
      }
   };

   var $ = obj;
   if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
      P.trace(P.normalize(expr).replace(/^\$;?/,""), obj, "$");  // issue 6 resolved
      return P.result.length ? P.result : false;
   }
} 
