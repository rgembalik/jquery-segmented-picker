#jquery-segmented-picker
##Try it
[http://rgembalik.github.io/jquery-segmented-picker/](http://rgembalik.github.io/jquery-segmented-picker/)
##Description
This plugin is simply wrapper for text input to become picker for any format you wish.
It is meant to be simple and to look simple while giving you some control over what user writes.

The main idea in it is to avoid showing complicated popups while there is possibility to use keyboard only.
That way you can incorporate it in any more complex forms without worrying about complicating layout further.

We will use it mainly as simple time picker, time duration picker and maybe as currency picker.

##Disclaimer
- This plugin is nowhere near ready. 
- It is full of nasty insects. 
- Button positioning may not work in some cases.

We are sharing it simply to let others use it and gather feedback if anyone would like to share one.
If you have any idea, please share it with me or fork the stuff and come back with pull request.

##Usage:
```javascript
$('input').segmentPicker({
    segments: [ segment, segment, ... ],
    onIncrement: function(newVal, oldVal, segments, segmentIdx){ ... },
    onDecrement: function(newVal, oldVal, segments, segmentIdx){ ... }
})
```

Parameters:

Name | Description
---- | -----------
`segments`|An array of segment definitions (see segment types below)
`onIncrement`|Callback for incrementing action. It is quite useful when you want to change another segment on value change (see 12h time picker example)
`onDecrement`|Callback for decrementing action. It is quite useful when you want to change another segment on value change (see 12h time picker example)

Possible segments:

Segment type | Expected parameter | Description   | Example
------------- | -------- | ------------- | -------
Numeric       | Object {min:*min*, max:*max*} | This segment will try to provide simple numeric spinner functionality on given segment | `{min:1, max:12}` - definition for hours in 12h format
Separator     | String "*separator*" | This segment is inactive for editing and will act simply as decoration for format      |   `"km/h "` - units are nice example of decorators
Enum          | Array [*Enum1, Enum2 ...* ] | This will act as very simple picker for already defined set of values |  `["am", "pm"]` - am/pm format

##Usage examples:

### simple floating point speed picker:
```javascript
$('input').segmentPicker({
    segments: [{min: 0, max: 999}, ".", {min: 0, max: 99}, " km/h"]
})
```

### more advanced 12h time format picker:
```javascript
$('inut').segmentPicker({
    segments: [{min: 1, max: 12}, ":", {min: 0, max: 59}, " ", ["am", "pm"]],
    onIncrement: function(newVal, oldVal, segments, selectedSegment)
    {
        if(selectedSegment == 0 && oldVal == "11" && newVal == "12")
            segments[4].increment();
        else if(selectedSegment == 2 && oldVal == "59" && newVal == "00")
            segments[0].increment()
    },
    onDecrement: function(newVal, oldVal, segments, selectedSegment){
        if(selectedSegment == 0 && oldVal == "12" && newVal == "11")
            segments[4].decrement();
        else if(selectedSegment == 2 && oldVal == "00" && newVal == "59")
            segments[0].decrement()
    }
});
```
