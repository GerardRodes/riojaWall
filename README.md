# riojaWall
Responsive Feed Wall

<div align="center"><img src="https://media.giphy.com/media/3o7TKVY9KUHvAebBle/giphy.gif" /></div>

It arranges items inside a container, if some columns are larger than others it makes them give away their childrens. Gross.

```javascript
Options = {
    itemSelector: '.item', \\css class selector for items
    cols: 4,               \\number of total columns
    animation: false,      \\Css transition or not
    transition: '1.75s ease-in-out'
  }
```


Use:
```html
<script type="text/javascript" src="riojawall.js"></script>
<script type="text/javascript">
	$(function(){
		$('#container').riojaWall()
	})
</script>
```
