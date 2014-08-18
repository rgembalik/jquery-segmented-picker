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

        this.increment = function ()
        {
        };

        this.increment = function ()
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

    function NumberPickerSegment(definition, callbacks)
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
            return ("0000" + userInput).slice(-this.length);
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
            var oldVal = this.getValue();

            var num = parseInt("00000" + userInput);

            num++;
            if(num > definition.max)
                num = definition.min;

            userInput = num + "";

            callbacks.onIncrement.call(this, oldVal);
        };
        this.decrement = function ()
        {
            var oldVal = this.getValue();

            var num = parseInt("00000" + userInput);
            num--;
            if (num < definition.min)
            {
                num = definition.max;
            }

            userInput = num + "";

            callbacks.onDecrement.call(this, oldVal);

        }
    }

    function EnumPickerSegment(definition, callbacks)
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
                if (definition[i].toLowerCase().indexOf(character.toLowerCase()) > -1)
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
            var oldVal = this.getValue();
            selectedValue++;
            selectedValue = selectedValue % definition.length;
            callbacks.onIncrement.call(this, oldVal);
        };
        this.decrement = function ()
        {
            var oldVal = this.getValue();

            selectedValue--;
            if (selectedValue < 0)
            {
                selectedValue = definition.length + selectedValue;
            }

            callbacks.onIncrement.call(this, oldVal);
        }
    }

    function PickerSegment(definition, index, startingPosition, callbacks)
    {
        this.index = index;
        this.position = startingPosition;
        if (typeof definition == "string")
        {
            SeparatorPickerSegment.call(this, definition, callbacks);
        }
        else if (typeof definition.min != "undefined" && typeof definition.max != "undefined")
        {
            NumberPickerSegment.call(this, definition, callbacks);
        }
        else if (definition instanceof Array)
        {
            EnumPickerSegment.call(this, definition, callbacks);
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
                $this.addClass('segment-picker');
                var buttons = $('<div class="segment-picker-buttons"><div class="segment-picker-button-up" data-up>▲</div><div data-down class="segment-picker-button-down">▼</div>&nbsp;</div>');
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
                        onIncrement: function(){},
                        onDecrement: function(){}
                    }, options);
                }

                $this.data('segmentPicker', {
                    target: $this,
                    settings: settings
                });

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

                function findNextSegment(from)
                {
                    for(var i = from + 1; i < segments.length; i++)
                    {
                        if(!segments[i].skipable)
                            return i;
                    }

                    return -1;
                }

                function findPrevSegment(from)
                {
                    for(var i = from - 1; i > -1; i--)
                    {
                        if(!segments[i].skipable)
                            return i;
                    }

                    return -1;
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

                var pos = 0;
                for (var i = 0; i < settings.segments.length; i++)
                {
                    var seg = new PickerSegment(settings.segments[i], i, pos, {
                        onIncrement:function(oldVal)
                        {
                            settings.onIncrement.call($this[0], this.getValue(), oldVal, segments, this.index);
                        },
                        onDecrement:function(oldVal)
                        {
                            settings.onDecrement.call($this[0], this.getValue(), oldVal, segments, this.index);
                        }
                    });
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

                $this.on('blur.segmentPicker', function (e){
                    selectedSegment = 0;
                });
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
                            var next = findNextSegment(selectedSegment);
                            if(next != -1)
                                selectedSegment = next;
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

                    var h = $this.height();
                    h += parseInt($this.css('border-top-width'), 10);
                    h += parseInt($this.css('padding-top'), 10);
                    h += parseInt($this.css('border-bottom-width'), 10);
                    h += parseInt($this.css('padding-bottom'), 10);

                    buttons.find('div').height(h/2).css({
                        'line-height': (h/2 - 1)+'px',
                        'font-size':((h * 0.8)/2)+'px',
                        'left':'-'+$this.css('margin-right')
                    });
                    buttons.find('div').first().css({
                        'top': '-' + $this.css('border-top-width')
                    });
                    buttons.find('div').last().css({
                        'bottom': '-'+ $this.css('border-bottom-width')
                    });
                    buttons.css({
                        'margin-top':$this.css('margin-top'),
                        'margin-bottom':$this.css('margin-bottom'),
                        'padding-top':$this.css('padding-top'),
                        'padding-bottom':$this.css('padding-bottom'),
                        'font-size':$this.css('font-size'),
                        'vertical-align':$this.css('vertical-align'),
                        'line-height': $this.css('line-height'),
                        'border-top':$this.css('border-top'),
                        'border-bottom':$this.css('border-bottom'),
                        'border-top-color':'transparent',
                        'border-bottom-color':'transparent',
                        'height': $this.css('height')
                    });
                    $this.after(buttons);
                });
                $this.on('mouseup.segmentPicker', function(e){
                    e.preventDefault();
                    setTimeout(function(){
                        selectSegment(selectedSegment);
                    })
                });
                $this.on('mousedown.segmentPicker', function (e)
                {
                    setTimeout(function(){
                        var minDiff = 9999999;
                        var pos = $this[0].selectionStart;
                        var newSegment = selectedSegment;
                        for (var i = 0; i < segments.length; i++)
                        {
                            var segment = segments[i];
                            if(segment.skipable)
                                continue;
                            if(Math.abs(segment.position - pos) < minDiff)
                            {
                                minDiff = Math.abs(segment.position - pos);
                                newSegment = i;
                            }

                            if(Math.abs(segment.position + segment.length - pos) < minDiff)
                            {
                                minDiff = Math.abs(segment.position + segment.length - pos);
                                newSegment = i;
                            }
                        }
                        selectedSegment = newSegment;
                        selectSegment(selectedSegment);
                    });

                });

                $this.on('keyup.segmentPicker', function (e)
                {
                    $this.focus();
                    e.preventDefault();
                });

                $this.on('change', function(){
                    var val = parseSegments($this.val());

                    if (val)
                    {
                        for (var i = 0; i < segments.length; i++)
                        {
                            segments[i].setUserInput(val[i]);
                        }
                        $this.val(render(segments));
                    }
                });

                $this.on('keydown.segmentPicker', function (e)
                {
                    var keyCode = e.which || e.charCode;
                    if(keyCode == 9)
                    {
                        if(e.shiftKey)
                        {
                            var prev = findPrevSegment(selectedSegment);
                            if(prev != -1)
                            {
                                selectedSegment = prev;
                                e.preventDefault();
                            }

                        }
                        else
                        {
                            var next = findNextSegment(selectedSegment);
                            if(next != -1)
                            {
                                selectedSegment = next;
                                e.preventDefault();
                            }
                        }
                    }
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
                            var prev = findPrevSegment(selectedSegment);
                            if(prev != -1)
                                selectedSegment = prev;

                        }
                        else if (keyCode == 39)
                        {

                            var next = findNextSegment(selectedSegment);
                            if(next != -1)
                                selectedSegment = next;
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
                });

                $this.on('blur.segmentPicker', function(){
                    setTimeout(function ()
                    {
                        buttons.detach();
                    })
                });

                buttons.find('[data-up]').on('mousedown mouseup', function (e)
                {
                    e.preventDefault();
                }).on('mousedown', function ()
                {
                    segments[selectedSegment].increment();
                    $this.val(render(segments));
                    $this.trigger('change');
                    selectSegment(selectedSegment);
                });
                buttons.find('[data-down]').on('mousedown mouseup', function (e)
                {
                    e.preventDefault();
                }).on('mousedown', function ()
                {
                    segments[selectedSegment].decrement();
                    $this.val(render(segments));
                    $this.trigger('change');
                    selectSegment(selectedSegment);
                });
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