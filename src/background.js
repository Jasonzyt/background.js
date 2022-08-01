class Background {
    /**
     * Construct the background
     * @param obj {
     *                background_element: HTMLElement|null,
     *                copyright_element: HTMLElement|null|false,
     *                require_tags: array[array[string]],
     *                copyright_presets: object|null,
     *                background_list: array[{src: string, copyright: object, tags: array[string]}],
     *                auto_colour: boolean,
     *                background_list_url: string
     *            }
     *            The background initialization object, containing the following fields:
     *            - background_element: The background element.
     *                                  Set to null to create a div element as the background element
     *            - copyright_element: The copyright element.
     *                                 Set to null to create a div element as the copyright element,
     *                                        false to disable the copyright element
     *            - require_tags: The tags that must be present in the background.
     *                            For example, [["a"], ["b", "c"]] means that
     *                               the background must contain ("a" tag) or ("b" tag and "c" tag).
     *            - copyright_presets: The copyright presets.
     *                                 The key in object is the preset name, and the value is a function that
     *                                   takes a copyright object and returns the copyright string.
     *                                 The default preset is "default".
     *                                 If the preset is not found or the copyright object doesn't have a preset entry,
     *                                   the default preset will be used.
     *                                 If no copyright preset is specified,
     *                                   the copyright element will simply be info.copyright.toString()
     *             - background_list: The background list.
     *                                The background list is an array of objects, each containing the following fields:
     *                                - src: The background image source.
     *                                - copyright: The copyright info object.
     *                                - tags: The tags that the background image contains.
     *                                        The tags must contain horizontal, vertical or square,
     *                                          because the background image will be cropped to fit the screen(element).
     *                                        If the background image doesn't contain the horizontal/vertical/square tag,
     *                                            the background image will be ignored.
     *             - auto_color: Whether to automatically color the copyright element.
     *                            If true, the copyright element will be colored according to the main color of
     *                              the background image that is below the copyright element.
     *             - background_list_url: The background list URL.
     *                                     If specified, the background list will be loaded from the URL.
     * @note It will automatically add the "horizontal", "vertical" or "square" tag to require_tags by the element size.
     */
    constructor(obj = {
        background_element: null,
        copyright_element: null,
        require_tags: [],
        auto_color: true
    }) {
        // Handle arguments
        let bg_elmt = obj.background_element;
        let cr_elmt = obj.copyright_element;
        let require_tags = obj.require_tags ?? [];
        let copyright_presets = obj["copyright_presets"] ?? null;
        let background_list = obj["background_list"] ?? [];
        let auto_color = obj["auto_color"] ?? true;
        let background_list_url = obj["background_list_url"];
        if (background_list_url !== undefined) {
            this.background_list_url = background_list_url;
        }
        // Handle background element
        if (bg_elmt == null) {
            this.background_element = document.createElement("div");
            this.background_element.classList.add("background");
            document.body.appendChild(this.background_element);
        } else if (typeof bg_elmt == "string") {
            this.background_element = document.getElementById(bg_elmt);
        } else {
            this.background_element = bg_elmt;
        }
        // Handle copyright element
        if (cr_elmt === null || cr_elmt === undefined) {
            this.copyright_element = document.createElement("div");
            this.copyright_element.classList.add("background-copyright");
            document.body.appendChild(this.copyright_element);
        } else if (cr_elmt === false) {
            this.copyright_element = null;
        } else if (typeof cr_elmt == "string") {
            this.copyright_element = document.getElementById(cr_elmt);
        } else {
            this.copyright_element = cr_elmt;
        }
        // Handle tags required
        require_tags = require_tags ?? [];
        let width = window.getComputedStyle(this.background_element).width.replace("px", "");
        let height = window.getComputedStyle(this.background_element).height.replace("px", "");
        let aspect_ratio = width / height;
        if (aspect_ratio > 1) {
            if (require_tags.length === 0) {
                require_tags.push(["horizontal"]);
            }
            require_tags.forEach(tags => {
                if (!tags.includes("horizontal") &&
                    !tags.includes("vertical") &&
                    !tags.includes("square")) {
                    require_tags.push(["horizontal"]);
                }
            });
        } else if (aspect_ratio < 1) {
            if (require_tags.length === 0) {
                require_tags.push(["vertical"]);
            }
            require_tags.forEach(tags => {
                if (!tags.includes("horizontal") &&
                    !tags.includes("vertical") &&
                    !tags.includes("square")) {
                    require_tags.push(["vertical"]);
                }
            });
        } else {
            if (require_tags.length === 0) {
                require_tags.push(["square"]);
            }
            require_tags.forEach(tags => {
                if (!tags.includes("horizontal") &&
                    !tags.includes("vertical") &&
                    !tags.includes("square")) {
                    require_tags.push(["square"]);
                }
            });
        }
        // Handle copyright presets
        copyright_presets = copyright_presets ?? {};
        if (copyright_presets["default"] === undefined) {
            copyright_presets["default"] = function (copyright) {
                return copyright.toString();
            }
        }
        //this.width = width;
        //this.height = height;
        this.require_tags = require_tags;
        this.copyright_presets = copyright_presets;
        this.background_image = new Image();
        this.background_list = background_list;
        this.auto_color = auto_color;
    }

    /**
     * Get random info
     * @returns {object} The random info
     */
    random_info() {
        let result = null;
        let background_list = Background.#shuffle(this.background_list);
        // tag1,tag2+tag3,tag4 => [[tag1], [tag2, tag3], [tag4]]
        for (let i = 0; i < background_list.length; i++) {
            const info = background_list[i];
            this.require_tags.forEach(function (sub_tags) {
                let found = true;
                sub_tags.forEach(function (tag) {
                    if (found) {
                        if (!info.tags.includes(tag)) {
                            found = false;
                        }
                    }
                });
                if (found) {
                    result = info;
                }
            });
            if (result != null) {
                break;
            }
        }
        return result;
    }

    /**
     * Set a random background image and load it
     * @returns this
     */
    random() {
        let info = this.random_info();
        if (info != null) {
            this.load(info);
        } else {
            throw new Error("No background match the requirement");
        }
        return this;
    }

    /**
     * Load the background
     * @param  info {object} The background info, null to random
     * @return this
     */
    load(info = null) {
        if (info == null) {
            info = this.random_info();
        }
        this.background_element.style.backgroundImage = `url(${info.src})`;
        this.background_image.src = info.src;
        this.background_image.onload = () => {
            if (this.copyright_element != null) {
                this.load_copyright(info, this.auto_color);
            }
        }
        return this;
    }

    /**
     * Load copyright info
     * @param  info {object} The background info
     * @param  auto_color {boolean} true to auto color the copyright
     * @return this
     */
    load_copyright(info, auto_color = true) {
        if (this.copyright_element == null) {
            throw new Error("No copyright element set");
        }
        this.copyright_element.style.display = 'block';
        let preset = this.copyright_presets[info["copyright"]["preset"]] ?? this.copyright_presets['default'];
        this.copyright_element.innerHTML = preset(info["copyright"]);

        if (auto_color) {
            let x = this.background_image.width - this.copyright_element.offsetWidth;
            let y = this.background_image.height - this.copyright_element.offsetHeight;
            let style = window.getComputedStyle(this.copyright_element);
            let w = Math.ceil(Number.parseFloat(style.width.replace("px", "")));
            let h = Math.ceil(Number.parseFloat(style.height.replace("px", "")));
            if (w && h) {
                let rgb = this.#getMainColor(this.background_image, x < 0 ? 0 : x, y < 0 ? 0 : y, w, h);
                this.copyright_element.style.color = this.#invert_color(rgb, true);
            }
        }
        return this;
    }

    /**
     * Load list from url async
     * @param  url {string|null} The url(If you already set the url in constructor, you can set it null)
     * @returns {Promise<Background>}  A promise that resolve to this
     */
    load_list_from_url_async(url = null) {
        if (this.background_list_url == null && url == null) {
            throw new Error("Background list url is null");
        }
        let u = url ?? this.background_list_url;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", u, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.background_list = JSON.parse(xhr.responseText);
            }
        }
        xhr.send();
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                resolve(this);
            };
            xhr.onerror = xhr.ontimeout = xhr.onabort = () => {
                reject(this);
            };
        });
    }

    /**
     * Load list from url
     * @param  url {string|null} The url(If you already set the url in constructor, you can set it null)
     * @returns {Background}  A promise that resolve to this
     */
    load_list_from_url(url = null) {
        if (this.background_list_url == null && url == null) {
            throw new Error("Background list url is null");
        }
        let u = url ?? this.background_list_url;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", u, false);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.background_list = JSON.parse(xhr.responseText);
            }
        }
        xhr.send();
        return this;
    }

    /**
     * Shuffle an array
     * @param arr   {array} The array to shuffle
     * @returns {*} The shuffled array
     */
    static #shuffle(arr) {
        let i = arr.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        return arr;
    }

    /**
     * Get the main color of an image
     * @param img {HTMLImageElement} The image element
     * @param x {number} The x-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
     * @param y {number} The y-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
     * @param w {number} The width of the rectangle from which the ImageData will be extracted. Positive values are to the right, and negative to the left.
     * @param h {number} The height of the rectangle from which the ImageData will be extracted. Positive values are down, and negative are up.
     * @returns {number[]} The RGB color of the main color
     */
    #getMainColor = (img, x, y, w, h) => {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        let imageData = ctx.getImageData(x, y, w, h);
        let data = imageData.data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            // Note: a = data[i + 3];
        }
        r = Math.floor(r / (data.length / 4));
        g = Math.floor(g / (data.length / 4));
        b = Math.floor(b / (data.length / 4));
        return [r, g, b];
    }

    /**
     * @param rgb {array[number]}  [r, g, b]
     * @param bw  {boolean}  true for black and white, false for colorful
     * @returns {string} RGB color string like 'rgb(r, g, b)'
     */
    #invert_color = (rgb, bw) => {
        let r = rgb[0], g = rgb[1], b = rgb[2];
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // Invert color components
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        return `rgb(${r}, ${g}, ${b})`;
    }

}