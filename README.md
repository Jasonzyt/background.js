# Background.js

A simple background interface in JavaScript & CSS.

## Usage

## Samples

### Random Background

```js
new Background({
    background_list: [
        {
            "src": "./img/backgrounds/scenery_20200802.jpg",
            "copyright": "&copy;Jasonzyt / Shot in Wuhan",
            "tags": [
                "landscape",
                "horizontal"
            ]
        },
        {
            "src": "./img/backgrounds/scenery_20200816.jpg",
            "copyright": "&copy;Jasonzyt / Shot in Wuhan",
            "tags": [
                "scenery",
                "horizontal"
            ]
        }
    ]
}).random();
```

### Only One Background

```js
new Background().load({
    src: 'background.jpg',
    copyright: '© copyright',
    tags: ['horizontal', "tag1", "tag2"]
});
```

### Random Background & List from URL

```js
new Background().load_list_from_url('backgrounds.json');
```

### Random Background & List from URL async

```js
(async function () {
    const background = new Background();
    await background.load_list_from_url_async('backgrounds.json');
    background.random();
})();
```

## Documentation

### class `Background`

#### Constructor

`new Background()`

***Parameters***

- `obj`

```  
{
  background_element: HTMLElement|null,
  copyright_element: HTMLElement|null|false,
  require_tags: array[array[string]],
  copyright_presets: object|null,
  background_list: array[{src: string, copyright: object, tags: array[string]}],
  auto_colour: boolean,
  background_list_url: string
}
```

The background initialization object, containing the following fields:

- `background_element`: The background element.  
  Set to null to create a div element as the background element
- `copyright_element`: The copyright element.  
  Set to null to create a div element as the copyright element, false to disable the copyright element
- `require_tags`: The tags that must be present in the background.  
  For example, [["a"], ["b", "c"]] means that the background must contain ("a" tag) or ("b" tag and "c" tag).
- `copyright_presets`: The copyright presets.  
  The key in object is the preset name, and the value is a function that takes a copyright object and returns the
  copyright string.  
  The default preset is "default".  
  If the preset is not found or the copyright object doesn't have a preset entry, the default preset will be used.  
  If no copyright preset is specified, the copyright element will simply be info.copyright.toString()
- `background_list`: The background list.  
  The background list is an array of objects, each containing the following fields:
    - `src`: The background image source.
    - `copyright`: The copyright info object.
    - `tags`: The tags that the background image contains.
      The tags must contain horizontal, vertical or square,
      because the background image will be cropped to fit the screen(element).
      If the background image doesn't contain the horizontal/vertical/square tag,
      the background image will be ignored.
- `auto_color`: Whether to automatically color the copyright element.
  If true, the copyright element will be colored according to the main color of
  the background image that is below the copyright element.
- `background_list_url`: The background list URL.
  If specified, the background list will be loaded from the URL.

***Note***  
It will automatically add the "horizontal", "vertical" or "square" tag to require_tags by the element size.

---

## Copyrights

### Third-party Images Used

The images in [demo/img/backgrounds](demo/img/backgrounds) aren't under the license.  
You shouldn't give out the images without giving the source link.  
The images are from [HoYoVerse](https://www.hoyoverse.com), [Jasonzyt](https://www.github.com/Jasonzyt).  
If your copyright is infringed, please contact me.  
(Only one [picture](demo/img/backgrounds/bilibili_post_625928209937638751.png)  was not created by me.
And this image is to test the auto color feature)

The project is only for learning and personal use.   
Please do not use it for commercial purposes unless you have obtained the authorization of the author of the background
picture.
