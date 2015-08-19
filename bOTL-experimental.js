"use strict";

(function(root, factory) { 
    
    if (typeof exports === 'object' && exports) {
        factory(exports); // CommonJS
    } else {
        var bOTL = {};
        factory(bOTL);
        if (typeof define === 'function' && define.amd)
            define(bOTL); // AMD
        else
            root.bOTL = bOTL; // <script>
    }

}(this, function(bOTL) {
    
    bOTL.name = 'bOTL.js';
    bOTL.version = '0.0.0';

    //bOTL transform external method
    bOTL.transform = function(aMASSource, abOTLTransform) 
    {
        var lresults = transform({
            '$': aMASSource,
            '@': aMASSource
        }, abOTLTransform);
        return first(lresults.results);
    }
    
    function transform(aScope, abOTLTransform) 
    {
        //transform using populated scope
        var lsectionF = getSectionFunction(abOTLTransform)
        var lresultsAndKeepNulls = lsectionF(aScope)
        return lresultsAndKeepNulls;
    }
    
    function getSectionFunction(abOTLTransform) 
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
                    lfunction = function(aScope) {
                        return evaluateFullSection(aScope, abOTLTransform)
                    }
                else if (ltype == "object")
                    lfunction = function(aScope) {
                        return evaluateObjectSection(aScope, abOTLTransform)
                    }
                else if (ltype == "literal")
                    lfunction = function(aScope) {
                        return evaluateLiteralSection(aScope, abOTLTransform)
                    }
                else
                    lfunction = function(aScope) {
                        return evaluateObject(aScope, abOTLTransform)
                    }
            } 
            else {
                lfunction = function(aScope) {
                    return evaluateObject(aScope, abOTLTransform)
                }
            }
        } 
        else if (isArray(abOTLTransform)) {
            lfunction = function(aScope) {
                return evaluateList(aScope, abOTLTransform)
            }
        } 
        else if (isString(abOTLTransform)) {
            if (abOTLTransform.slice(0, 1) == '#') {
                lfunction = function(aScope) {
                    return evaluateFullSection(aScope, {
                        '_type': '#',
                        'path': abOTLTransform.slice(1)
                    })
                }
            } 
            else {
                lfunction = function(aScope) {
                    return evaluateLiteral(abOTLTransform)
                }
            }
        } 
        else {
            lfunction = function(aScope) {
                return evaluateLiteral(abOTLTransform)
            }
        }
        
        return lfunction
    }

    // evaluate functions must return 
    // {results: <a list of results>, keepnulls: <boolean>}
    
    function evaluateLiteral(abOTLLiteral) {
        return {
            results: [abOTLLiteral],
            keepnulls: true
        };
    }
    
    function evaluateFullSection(aScope, abOTLSection) 
    {
        //1: evaluate the path
        var lpath = abOTLSection.path || '@';

        // this is a bit of a hack. I'd like to be able to tell jsonpath to use the attribute '$' as the root,
        // but the library doesn't support that.
        var lscope = (lpath[0] == '$') ? aScope['$'] : aScope;
        
        var lresults;
        var lselections = jsonPath(lscope, lpath);
        if (isArray(lselections)) 
        {
            // here we've got some results
            if ('transform' in abOTLSection) {
                // need to transform all items in selection
                
                lresults = mutate(lselections, function(acc, aSelection) {
                    
                    var aScope2 = copy(aScope);
                    aScope2['@'] = aSelection;
                    var lscopeid = abOTLSection.scope;
                    if (lscopeid)
                        aScope2[lscopeid] = aSelection
                    
                    var lchildResults = transform(aScope2, abOTLSection.transform);
                    pushall(acc, lchildResults.results);
                
                }, []);
            } 
            else
                lresults = lselections
        } 
        else {
            // here we've got no results
            var lhasnulltransform = 'nulltransform' in abOTLSection;
            var lnulltransform = abOTLSection.nulltransform;
            if (lhasnulltransform)
                lresults = transform(aScope, lnulltransform).results;
            else
                lresults = []
        }
        
        var lkeepnulls = 'nulls' in abOTLSection ? abOTLSection.nulls : true;
        return {
            results: lkeepnulls ? lresults : filter(lresults, function(aResult) {
                return aResult;
            }),
            keepnulls: lkeepnulls
        }
    }
    
    function evaluateObjectSection(aScope, abOTLObjectSection) {
        
        var lvalue = abOTLObjectSection.value || null;
        if (isObject(lvalue)) {
            
            var lresults = mutate(lvalue, function(acc, avalue, akey) {
                var litem;
                if (akey == '_type') {
                    litem = avalue
                } 
                else {
                    var lchildResults = transform(aScope, avalue);
                    litem = first(lchildResults.results);
                }
                if (litem || lkeepnulls)
                    acc[akey] = litem;
            }, {});
            
            return {
                results: [lresults],
                keepnulls: true
            }
        } 
        else {
            return {
                results: null,
                keepnulls: true
            }
        }
    }
    
    function evaluateLiteralSection(aScope, abOTLObjectSection) {
        return {
            results: [abOTLObjectSection.value != null ? abOTLObjectSection.value : null],
            keepnulls: true
        }
    }
    
    function evaluateObject(aScope, abOTLObject) {
        
        var lresults = mutate(abOTLObject, function(acc, aItem, aKey) {
            
            var lValue = transform(aScope, abOTLObject[aKey]);
            if (lValue.results.length || lValue.keepnulls)
                acc[aKey] = first(lValue.results);
        }, {});
        
        return {
            results: [lresults],
            keepnulls: true
        }
    }
    
    function evaluateList(aScope, abOTLList) {
        
        var lresults = mutate(abOTLList, function(acc, aItem) {
            var lresult = transform(aScope, aItem)
            pushall(acc, lresult.results);
        }, []);
        
        return {
            results: [lresults],
            keepnulls: true,
        }
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
    
    function first(array) {
        return array ? array[0] : undefined;
    }
    
    function filter(array, func) {
        return array.reduce(function(acc, item) {
            if (func(item))
                acc.push(item);
            return acc;
        }, [])
    }
    
    function copy(object) {
        return Object.keys(object).reduce(function(acc, key) {
            acc[key] = object[key];
            return acc;
        }, {});
    }
    
    function mutate(object, func, accumulator) {
        var pfunc = function() {
            return function(v, k) {
                return func(accumulator, v, k) !== false;
            }
        }();
        if (isArray(object)) {
            object.every(pfunc);
        } 
        else if (isObject(object)) {
            Object.keys(object).every(function(key) {
                return pfunc(object[key], key)
            });
        }
        return accumulator;
    }
    
    function pushall(array1, array2) {
        [].push.apply(array1, array2);
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
                return expr.replace(/[\['](\??\(.*?\))[\]']|\['(.*?)'\]/g, function($0, $1, $2) {
                    return "[#" + (subx.push($1 || $2) - 1) + "]";
                }) /* http://code.google.com/p/jsonpath/issues/detail?id=4 */
                .replace(/'?\.'?|\['?/g, ";")
                .replace(/;;;|;;/g, ";..;")
                .replace(/;$|'?\]|'$/g, "")
                .replace(/#([0-9]+)/g, function($0, $1) {
                    return subx[$1];
                });
            },
            asPath: function(path) {
                var x = path.split(";"), p = "$";
                for (var i = 1, n = x.length; i < n; i++)
                    p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
                return p;
            },
            store: function(p, v) {
                if (p)
                    P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
                return !!p;
            },
            trace: function(expr, val, path) {
                if (expr !== "") {
                    var x = expr.split(";"), loc = x.shift();
                    x = x.join(";");
                    if (val && val.hasOwnProperty(loc))
                        P.trace(x, val[loc], path + ";" + loc);
                    else if (loc === "*")
                        P.walk(loc, x, val, path, function(m, l, x, v, p) {
                            P.trace(m + ";" + x, v, p);
                        });
                    else if (loc === "..") {
                        P.trace(x, val, path);
                        P.walk(loc, x, val, path, function(m, l, x, v, p) {
                            typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m);
                        });
                    } 
                    else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                        P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                    else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                        P.walk(loc, x, val, path, function(m, l, x, v, p) {
                            if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v instanceof Array ? v[m] : v, m))
                                P.trace(m + ";" + x, v, p);
                        }); // issue 5 resolved
                    else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                        P.slice(loc, x, val, path);
                    else if (/,/.test(loc)) { // [name1,name2,...]
                        for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                            P.trace(s[i] + ";" + x, val, path);
                    }
                } 
                else
                    P.store(path, val);
            },
            walk: function(loc, expr, val, path, f) {
                if (val instanceof Array) {
                    for (var i = 0, n = val.length; i < n; i++)
                        if (i in val)
                            f(i, loc, expr, val, path);
                } 
                else if (typeof val === "object") {
                    for (var m in val)
                        if (val.hasOwnProperty(m))
                            f(m, loc, expr, val, path);
                }
            },
            slice: function(loc, expr, val, path) {
                if (val instanceof Array) {
                    var len = val.length, start = 0, end = len, step = 1;
                    loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0, $1, $2, $3) {
                        start = parseInt($1 || start);
                        end = parseInt($2 || end);
                        step = parseInt($3 || step);
                    });
                    start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                    end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                    for (var i = start; i < end; i += step)
                        P.trace(i + ";" + expr, val, path);
                }
            },
            eval: function(x, _v, _vname) {
                try {
                    return $ && _v && eval(x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@"));
                }  // issue 7 : resolved ..
                catch (e) {
                    throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@"));
                } // issue 7 : resolved ..
            }
        };
        
        var $ = obj;
        if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
            P.trace(P.normalize(expr).replace(/^\$;?/, ""), obj, "$"); // issue 6 resolved
            return P.result.length ? P.result : false;
        }
    }

}));
