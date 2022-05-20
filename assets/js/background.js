const background = {
    background_div: null,
    copyright_div: null,
    copyright_preset: {
        "default": function (data) {
            return 'Background ' + data.toString();
        },
        "custom:html": function (data) {
            return 'Background ' + data["html"];
        },
        "pixiv": function (data) {
            let p = data['picture'] ?? 1;
            return `Background &copy;<a class="link" href="${data["author"]?.link}">${data["author"]?.name}</a> / Pixiv Illustration: <a class="link" href="https://www.pixiv.net/artworks/${data.id}#${p}" target="_blank">${data.id}</a>`
        },
        "bilibili:post": function (data) {
            return `Background &copy;<a class="link" href="${data["author"]?.link}">${data["author"]?.name}</a> / <a class="link" href="${data.url}" target="_blank">Bilibili Post</a>`;
        },
        "bilibili:video&post": function (data) {
            `Background &copy;<a class="link" href="${data["author"]?.link}">${data["author"]?.name}</a> / <a class="link" href="${data["post"]}" target="_blank">Bilibili Post</a> / Video: <a class="link" href="https://bilibili.com/video/${data["bvid"]}?t=${data["time"]}" target="_blank">${data["bvid"]}</a>`;
        }
    },
    background_img: null,
    current: null,
    api: "http://localhost/random-background/api",
    token: null,
    /**
     * Initialize the background
     * @param bg_div  The background div element id
     * @param cr_div  The copyright div element id
     * @param api     The api server url
     * @param token   The api token
     * @return this
     */
    init: function (bg_div = "background",
                   cr_div = "bg-copyright",
                   api = null,
                   token = null) {
        this.background_div = document.getElementById(bg_div);
        this.copyright_div = document.getElementById(cr_div);
        if (api) {
            if (api[api.length - 1] === "/" || api[api.length - 1] === "\\") {
                this.api = api.substring(0, api.length - 1);
            }
            this.api = api;
        }
        if (token) {
            this.token = token;
        }
        return this;
    },
    /**
     * Load a random background
     * @param copyright  Whether to show the copyright or not
     */
    load: function (copyright = true) {
        let width = window.screen.availWidth;
        let height = window.screen.availHeight;
        let aspect_ratio = width / height;
        let api_url = this.api + '/random.php';
        if (aspect_ratio > 1) {
            api_url += '?require=horizontal';
        } else {
            api_url += '?require=vertical';
        }
        if (this.token) {
            api_url += '&token=' + this.token;
        }
        if (!this.background_div) {
            throw new Error("Background div is null");
        }
        this.background_div.style.background = "url('" + api_url + "') no-repeat center center fixed";

        this.background_img = new Image();
        // Waiting for the image to load
        this.background_img.src = api_url;
        this.background_img.onload = function() {
            let req = new XMLHttpRequest();
            req.open('GET', `${background.api}/current.php`);
            req.onload = function() {
                if (req.status === 200 && req.responseText !== "{}") {
                    let data = JSON.parse(req.responseText);
                    let dWidth = window.screen.availWidth / data.width;
                    let dHeight = window.screen.availHeight / data.height;
                    let d = Math.max(dHeight, dWidth);
                    background.background_div.style.zoom = d.toString();
                    background.current = data;
                    if (copyright) {
                        background.loadCopyrightInfo(data["copyright"]);
                    }
                }
            }
            req.send();
        }
    },
    /**
     * Display the copyright information
     * @param autoColor  Whether to auto color the copyright or not(this may take a few seconds to calculate)
     */
    loadCopyrightInfo: function(autoColor = true) {
        this.copyright_div.style.display = 'block';
        if (this.current) {
            let preset = this.copyright_preset[this.current["copyright"]["preset"]] ?? this.copyright_preset['default'];
            this.copyright_div.innerHTML = preset(this.current["copyright"]);

            if (autoColor) {
                let x = this.background_img.width - this.copyright_div.offsetWidth;
                let y = this.background_img.height - this.copyright_div.offsetHeight;
                let style = window.getComputedStyle(this.copyright_div);
                let w = Math.ceil(Number.parseFloat(style.width.replace("px", "")));
                let h = Math.ceil(Number.parseFloat(style.height.replace("px", "")));
                if (w && h) {
                    let rgb = this.getMainColor( x < 0 ? 0 : x, y < 0 ? 0 : y, w, h);
                    this.copyright_div.style.color = this.invertColor(rgb, true);
                }
            }
        }
    },

    /**
     * Get the main color of an image
     * @param x {number} The x-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
     * @param y {number} The y-axis coordinate of the top-left corner of the rectangle from which the ImageData will be extracted.
     * @param w {number} The width of the rectangle from which the ImageData will be extracted. Positive values are to the right, and negative to the left.
     * @param h {number} The height of the rectangle from which the ImageData will be extracted. Positive values are down, and negative are up.
     * @returns {number[]} The RGB color of the main color
     */
    getMainColor: function (x, y, w, h) {
        let img = this.background_img;
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
    },
    /**
     * @param rgb {array} [r, g, b]
     * @param bw {boolean} true for black and white, false for colorful
     * @returns {string} RGB color string like 'rgb(r, g, b)'
     */
    invertColor: function (rgb, bw) {
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
};