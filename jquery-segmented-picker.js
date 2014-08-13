(function ($)
{
    function SeparatorPickerSegment(definition)
    {
        this.length = definition.length;
        this.getUserInput = function ()
        {
            return definition;
        };
        this.getReg = function ()
        {
            return definition;
        };
        this.getValue = function ()
        {
            return definition;
        };

        this.addUserInput = function ()
        {
        };

        this.delUserInput = function ()
        {
        };
        this.setUserInput = function ()
        {
        };
        this.accepts = function ()
        {
            return false;
        };
        this.isUserInputExplicit = function()
        {
            return true;
        };
        this.skipable = true;

    }

    function NumberPickerSegment(definition)
    {
        var userInput = "";
        this.length = Math.max((definition.min + "").length, (definition.max + "").length);
        this.skipable = false;
        this.getReg = function ()
        {
            return "[0-9]{" + this.length + "}";
        };
        this.setUserInput = function (val)
        {
            userInput = val
        };
        this.getUserInput = function ()
        {
            return definition;
        };
        this.getValue = function ()
        {
            return ("0000" + userInput).slice(-2);
        };

        this.accepts = function (character)
        {
            if(!this.isUserInputExplicit()){
                var addedVal = parseInt(userInput + character, 10);
                return !isNaN(addedVal);
            }

            return parseInt(character, 10) <= definition.max && parseInt(character, 10) >= definition.min;
        };
        this.delUserInput = function ()
        {
            if(userInput.length > 0)
            {
                userInput = userInput.slice(0,userInput.length - 1);
            }
        };
        this.addUserInput = function (character)
        {
            var addedVal = parseInt(character, 10);
            if (!isNaN(addedVal))
            {
                if (userInput.length == this.length || parseInt(userInput + addedVal) > definition.max)
                {
                    userInput = "";
                }

                userInput = userInput + addedVal;
            }

        };
/*
        var val = parseInt("0" + userInput);
        if(val < definition.min)
            val = definition.min + "";
        else if(val < definition.max)
            val = definition.max + "";

        userInput = val + "";*/
        this.isUserInputExplicit = function()
        {
            return parseInt(userInput + "0") > definition.max || userInput.length == this.length;
        };
        this.increment = function ()
        {
            var num = parseInt("00000" + userInput);

            num++;
            num = num % definition.max;

            userInput = num + "";
        };
        this.decrement = function ()
        {
            var num = parseInt("00000" + userInput);
            num--;
            if (num < definition.min)
            {
                num = definition.max;
            }

            userInput = num + "";
        }
    }

    function EnumPickerSegment(definition)
    {
        var maxLen = 0;
        for (var i = 0; i < definition.length; i++)
        {
            if (definition[i].length > maxLen)
            {
                maxLen = definition[i].length;
            }
        }
        var search = "";
        var selectedValue = 0;

        var research = function (searchString)
        {
            for (var i = 0; i < definition.length; i++)
            {
                var idx = definition[i].toLowerCase().indexOf(searchString.toLowerCase());
                if (idx >= 0)
                {
                    selectedValue = i;
                    return true;
                }
            }

            return false;
        };

        this.length = maxLen;
        this.skipable = false;
        this.setUserInput = function (val)
        {
            search = val;
            if(!research(search))
            {
                search = "";
                research("");
            }
        };
        this.accepts = function (character)
        {
            for (var i = 0; i < definition.length; i++)
            {
                if (definition[i].indexOf(character) > -1)
                {
                    return true;
                }
            }
            return false;
        };
        this.getUserInput = function ()
        {
            return search;
        };
        this.getReg = function ()
        {
            var res = [];
            for (var i = 0; i < definition.length; i++)
            {
                res.push(definition[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
            }
            return res.join('|');
        };
        this.getValue = function ()
        {
            return definition[selectedValue]
        };
        this.addUserInput = function (char)
        {
            if (search.length == this.length)
            {
                search = "";
            }
            search += char;
            if(!research(search))
            {
                if(research(char))
                {
                    search = char;
                }
                else
                {
                    search = "";
                    research("")
                }
            }
        };
        this.isUserInputExplicit = function()
        {
            var cnt = 0;
            for (var i = 0; i < definition.length; i++)
            {
                var idx = definition[i].toLowerCase().indexOf(search.toLowerCase());
                if (idx >= 0)
                {
                    cnt ++;
                }
            }
            return cnt == 1;
        };
        this.delUserInput = function ()
        {
            if(search.length > 0)
            {
                search = search.slice(0,search.length - 1);
                if(!research(search))
                {
                    search = "";
                    research("");
                }
            }
        };
        this.increment = function ()
        {
            selectedValue++;
            selectedValue = selectedValue % definition.length;
        };
        this.decrement = function ()
        {
            selectedValue--;
            if (selectedValue < 0)
            {
                selectedValue = definition.length + selectedValue;
            }
        }
    }

    function PickerSegment(definition, startingPosition)
    {
        this.position = startingPosition;
        if (typeof definition == "string")
        {
            SeparatorPickerSegment.call(this, definition);
        }
        else if (typeof definition.min != "undefined" && typeof definition.max != "undefined")
        {
            NumberPickerSegment.call(this, definition);
        }
        else if (definition instanceof Array)
        {
            EnumPickerSegment.call(this, definition);
        }
    }

    var methods = {
        init: function (options)
        {
            return $(this).filter('input').each(function ()
            {
                var $this = $(this);
                var settings;
                var segments = [];
                var selectedSegment = 0;

                function selectSegment(idx)
                {
                    var seg = segments[idx];
                    if (seg)
                    {
                        $this[0].setSelectionRange(seg.position, seg.position + seg.length);
                    }
                }

                function getReg()
                {
                    var value = "";
                    for (var i = 0; i < segments.length; i++)
                    {
                        value += "(" + segments[i].getReg() + ")";
                    }
                    return value;
                }

                function parseSegments(value)
                {
                    var reg = new RegExp('' + getReg() + '', 'i');
                    if (reg.test(value))
                    {
                        var match = reg.exec(value);
                        var result = [];
                        for (var i = 0; i < segments.length; i++)
                        {
                            result.push(match[i + 1]);
                        }
                        return result;
                    }

                    return undefined;
                }

                function render()
                {
                    var value = "";
                    for (var i = 0; i < segments.length; i++)
                    {
                        value += segments[i].getValue();
                    }
                    return value;
                }

                if ($this.segmentPicker('isConnected'))
                {
                    var temp = $this.data('segmentPicker');
                    settings = $.extend(temp.settings, options);
                    $this.off('.segmentPicker');
                }
                else
                {
                    settings = $.extend({
                        segments: [],
                        onValidate: function (val)
                        {
                            return val
                        }
                    }, options);
                }

                $this.data('segmentPicker', {
                    target: $this,
                    settings: settings
                });

                var pos = 0;
                for (var i = 0; i < settings.segments.length; i++)
                {
                    var seg = new PickerSegment(settings.segments[i], pos);
                    pos = pos + seg.length;
                    segments.push(seg);
                }

                var init = parseSegments($this.val());

                if (init)
                {
                    for (var i = 0; i < segments.length; i++)
                    {
                        segments[i].setUserInput(init[i]);
                    }
                    $this.val(render(segments));
                }


                $this.on('keypress.segmentPicker', function (e)
                {
                    var character = e.ehcich || e.charCode;
                    var strChar = String.fromCharCode(character);
                    if (segments[selectedSegment].accepts(strChar))
                    {
                        segments[selectedSegment].addUserInput(strChar.toLowerCase());
                        $this.val(render(segments));
                        if(segments[selectedSegment].isUserInputExplicit())
                        {
                            do {
                                selectedSegment = Math.min(selectedSegment + 1, segments.length - 1);
                            } while (segments[selectedSegment].skipable && selectedSegment < segments.length - 1);
                        }
                        selectSegment(selectedSegment);
                    }
                    e.preventDefault();
                });

                $this.on('focus.segmentPicker', function (e)
                {
                    if (!$this.val())
                    {
                        var init = parseSegments($this.data('default'));
                        if (init)
                        {
                            for (var i = 0; i < segments.length; i++)
                            {
                                segments[i].setUserInput(init[i]);
                            }
                            $this.val(render(segments));
                        }
                    }

                    selectSegment(selectedSegment);
                    e.preventDefault();
                });
                $this.on('mousedown.segmentPicker', function (e)
                {
                    $this.focus();
                    e.preventDefault();
                });

                $this.on('keyup.segmentPicker', function (e)
                {
                    $this.focus();
                    e.preventDefault();
                });

                $this.on('keydown.segmentPicker', function (e)
                {

                    var keyCode = e.which || e.charCode;
                    console.log('keyCode', keyCode);
                    if(keyCode == 8 || keyCode == 46){
                        segments[selectedSegment].delUserInput();
                        e.stopPropagation();
                        e.preventDefault();
                        $this.val(render(segments));
                        selectSegment(selectedSegment);
                    }
                    if (keyCode >= 37 && keyCode <= 40)
                    {
                        e.stopPropagation();
                        e.preventDefault();

                        if (keyCode == 37)
                        {
                            do {
                                selectedSegment = Math.max(selectedSegment - 1, 0);
                            } while (segments[selectedSegment].skipable && selectedSegment > 0);

                        }
                        else if (keyCode == 39)
                        {
                            do {
                                selectedSegment = Math.min(selectedSegment + 1, segments.length - 1);
                            } while (segments[selectedSegment].skipable && selectedSegment < segments.length - 1);
                        }
                        else if (keyCode == 38)
                        {
                            segments[selectedSegment].increment();
                            $this.val(render(segments));
                        }
                        else if (keyCode == 40)
                        {
                            segments[selectedSegment].decrement();
                            $this.val(render(segments));
                        }
                        selectSegment(selectedSegment);
                        return;
                    }
                });

                $this.on('cut.segmentPicker copy.segmentPicker paste.segmentPicker', function (e)
                {
                    e.preventDefault();
                })
            });
        },
        isConnected: function ()
        {
            var $this = $(this);
            var data = $this.data('segmentPicker');
            return data !== undefined;
        }
    };

    $.fn.segmentPicker = function (method)
    {
        if (methods[method])
        {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method)
        {
            return methods.init.apply(this, arguments);
        }
        else
        {
            $.error('Method ' + method + ' does not exist on jQuery.segmentPicker');
        }
    };
})(jQuery);

$(function ()
{
    $('input').segmentPicker({
        //segments: [ {min: 0, max: 23 }, ":", { min: 0, max: 59 }, " ", ["am", "pm"] ]
        segments: [ {min: 1, max: 12 }, ":", { min: 0, max: 59 }, " ", ["am", "pm"] ]
        //segments: [{min: 0, max: 24}, "h ", {min: 0, max: 59}, "m"]
    }).on('change keyup', function(){console.log('$(this).val()', $(this).val());});
});