#jquery-segmented-picker
##Description
This plugin is simply wrapper for text input to become picker for any format you wish. 

The main idea in it is to avoid showing complicated popups while there is possibility to use keyboard only. That way you can incorporate it in any more complex forms without worrying about UX.

We will use it mainly as simple time picker, time duration picker and maybe as currency picker.

##Usage:
```
$('input').segmentPicker({
    segments: [ segment, segment, ... ]
})
```

Possible segments:

Segment type  | Description   | Example
------------- | ------------- | -------
Numeric       | This segment will try to provide simple spinner usage on given segment | `{min:1, max:12}` - definition for hours in 12h format
Separator     | This segment is inactive for editing and will act simply as decoration for format      |   `"km/h "` - units are nice example of decorators
Enum          | This will act as very simple picker for already defined set of values |  `["am", "pm"]` - am/pm format

##Usage examples:

### 12h time format picker:
```javascript
$('input').segmentPicker({
    segments: [{min: 1, max: 12}, ":", {min: 0, max: 59}, " ", ["am", "pm"]]
})
```

### floating point speed picker:
```javascript
$('input').segmentPicker({
    segments: [{min: 0, max: 999}, ".", {min: 0, max: 99}, " km/h"]
})
```