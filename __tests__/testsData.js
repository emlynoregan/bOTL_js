module.exports = {
    "transforms": {
        "root": "#$.name",
        "local": "#@.name",
        "list": [ "#@.name" ],
        "object1": {"saying": ["#@.quote"], "fullname": "#@.name"},
        "synopsis": {
          "characters": [
            {
              "_type": "#",
              "path": "$.items[*]",
              "transform": {
                "fullname": "#@.name",
                "saying": {
                  "_type": "#",
                  "path": "@..quote",
                  "nulls": false
                }
              }
            }
          ],
          "urls": [
            "#$..website"
          ]
        },
        "basics": {"urls": ["#$..website"]},
        "sections1": {"_type": "#"},
        "sections2": [
         {
          "_type": "#",
          "path": "$.items[*].type"
         }
        ],
        "sections3": {
          "_type": "#",
          "path": "$..things",
          "nulltransform": "none"
        },
        "sections4": [
         {
          "_type": "#",
          "path": "$.items[*].type",
          "transform": {
            "race": {
              "_type": "#"
            }
          }
         }
        ],
        "brief1": "#",
        "brief2": [ "#$.items[*].type" ],
        "brief4": [
            {
              "_type": "#",
              "path": "$.items[*].type",
              "transform": {
                "race": "#"
              }
            }
        ],
        "scope": [
         {
          "_type": "#",
          "path": "$.items[*]",
          "scope": "item",
          "transform": 
            {
                "_type": "#",
                "path": "@..images",
                "transform": {
                  "name": "#item.name",
                  "pics": [
                    {
                      "_type": "#",
                      "path": "@" 
                    }
                  ]
                }
            }
         }
        ],
        "scope2": [
         {
          "_type": "#",
          "path": "$.items[*]",
          "scope": "item",
          "transform": 
            {
                "_type": "#",
                "path": "@..images",
                "transform": {
                  "name": "#item.name",
                  "pics": [
                    {
                      "_type": "#",
                      "path": "@[*]" 
                    }
                  ]
                },
                "nulltransform": {
                  "name": "#item.name",
                  "nopics": true
                }
            }
         }
        ],
        "scope3": [
            {
                "_type": "#",
                "path": "$.items[*]",
                "scope": "item",
                "transform": 
                {
                    "name": "#@.name",
                    "pics": {
                        "_type": "#",
                        "path": "@..images",
                        "nulls": false
                    }
                }
            }
        ],
        "list2": [
            {
              "_type": "#",
              "path": "@..images",
              "transform": {
                "name": "XX",
                "pics": [
                    {
                      "_type": "#",
                      "path": "@[*]",
                      "nulls": false
                    }
                ]
              }
            }
        ],
        "context1": [ "#$..website", "#$..images[*]" ],
        "context2": "#$..website",
        "context3": {
          "stuff": {
            "_type": "#",
            "path": "$.stuff"
          },
          "thing": {
            "_type": "#",
            "path": "$.thing",
            "nulls": false
          }
        },
        "ObjectSection": {
          "_type": "object",
          "value": {
            "_type": "#",
            "transform": {
              "names": ["#$..name"]
            }
          }
        },
        "LiteralSection": {
          "_type": "literal",
          "value": {
            "_type": "#",
            "transform": {
              "names": ["#$..name"]
            }
          }
        },
        "KeepNulls": [{
            "_type": "#",
            "path": "$..items[*]",
            "transform": {
                "_type": "#",
                "path": "@..quote",
                "transform": {
                    "quote": "#@"
                },
                "nulltransform": null
            },
            "nulls": true
        }],
        "DontKeepNulls": [{
            "_type": "#",
            "path": "$..items[*]",
            "transform": {
                "_type": "#",
                "path": "@..quote",
                "transform": {
                    "quote": "#@"
                },
                "nulltransform": null
            },
            "nulls": false
        }]
    },
    "sources": {
        "freddo string": "Freddo",
        "freddo in list": ["Freddo"],
        "object1": {"saying": [], "fullname": "Freddo"},
        "synopsis": {
              "characters": [
                {
                  "fullname": "Ambassador Kosh",
                  "saying": "Yes"
                },
                {
                  "fullname": "Worf"
                },
                {
                  "fullname": "Stanley Tweedle"
                }
              ],
              "urls": [
                "http://babylon5.wikia.com/wiki/Kosh",
                "https://en.wikipedia.org/wiki/Worf",
                "http://lexx.wikia.com/wiki/Stanley_Tweedle"
              ]
            },
        "basics": {
              "urls": [
                "http://babylon5.wikia.com/wiki/Kosh",
                "https://en.wikipedia.org/wiki/Worf",
                "http://lexx.wikia.com/wiki/Stanley_Tweedle"
              ]
            },
        "freddo dict": {"name": "Freddo"},
        "source1": {
          "cursor": "8b08006b-963a-6909-c132-cc618cd4b352",
          "more": true,
          "items": [
            {
              "name": "Ambassador Kosh",
              "type": "Vorlonn",
              "resources": {
                "website": "http://babylon5.wikia.com/wiki/Kosh",
                "quote": "Yes"
              }
            },
            {
              "name": "Worf",
              "type": "Klingon",
              "resources": {
                "website": "https://en.wikipedia.org/wiki/Worf",
                "images": [
                  "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
                  "http://example.com/worf.jpg"
                ]
              }
            },
            {
              "name": "Stanley Tweedle",
              "type": "Human",
              "resources": {
                "website": "http://lexx.wikia.com/wiki/Stanley_Tweedle"
              }
            }
          ]
        },
        "races list": ["Vorlonn", "Klingon", "Human"],
        "none string": "none",
        "races objs": [
          { "race": "Vorlonn" },
          { "race": "Klingon" },
          { "race": "Human" }
        ],
        "scope": [
          {
            "name": "Worf",
            "pics": [
              [
                "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
                "http://example.com/worf.jpg"
              ]
            ]
          }
        ],
        "scope2": [
          {
            "name": "Ambassador Kosh",
            "nopics": true
          },
          {
            "name": "Worf",
            "pics": [
              "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
              "http://example.com/worf.jpg"
            ]
          },
          {
            "name": "Stanley Tweedle",
            "nopics": true
          }
        ],
        "scope3": [
          {
            "name": "Ambassador Kosh"
          },
          {
            "name": "Worf",
            "pics": [
              "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
              "http://example.com/worf.jpg"
            ]
          },
          {
            "name": "Stanley Tweedle"
          }
        ],
        "list2": [
          {
            "name": "XX",
            "pics": [
              "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
              "http://example.com/worf.jpg"
            ]
          }
        ],
        "context1": [
          "http://babylon5.wikia.com/wiki/Kosh",
          "https://en.wikipedia.org/wiki/Worf",
          "http://lexx.wikia.com/wiki/Stanley_Tweedle",
          "https://en.wikipedia.org/wiki/File:WorfTNG.jpg",
          "http://example.com/worf.jpg"
        ],
        "context2": "http://babylon5.wikia.com/wiki/Kosh",
        "context3": {
          "stuff": null
        },
        "ObjectSection": {
          "_type": "#",
          "transform": {
            "names": [
              "Ambassador Kosh",
              "Worf",
              "Stanley Tweedle"
            ]
          }
        },
        "LiteralSection": {
          "_type": "#",
          "transform": {
            "names": ["#$..name"]
          }
        },
        "KeepNulls": [{"quote": "Yes"}, null, null],
        "DontKeepNulls": [{"quote": "Yes"}]
    }
};
