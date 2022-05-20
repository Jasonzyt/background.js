# RandomBackground
A simple random background interface

## Copyrights
### third-party images used
The images in [assets/img/backgrounds](assets/img/backgrounds) aren't under the license.  
You shouldn't give out the images without giving the source link.  
The images are from [pixiv](https://pixiv.net), [bilibili](https://www.bilibili.com), [Jasonzyt](https://www.github.com/Jasonzyt).  
If your copyright is infringed, please contact me.

The project is only for learning and personal use.   
Please do not use it for commercial purposes unless you have obtained the authorization of the author of the background picture.

## Requirement
- Web service(such as Apache, Nginx, etc.)
- PHP 8.0 (at least with following extensions)
  - gd

## Usage
1. Download the latest release from GitHub or clone the repo with git  
  `git clone https://github.com/Jasonzyt/random-background`
2. Add site and edit site config
3. View (and modify) `config.php`
4. Start web service  
  `systemctl start xxx`

### Apache
If you want to enable access token, you should create a file named `.htaccess` and add the following config in it
```
Options +FollowSymlinks -MultiViews
RewriteEngine On
# Authorization Headers
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```
If you want to access APIs without `.php` file extension, you should append the following config in `.htaccess`
```
# Access without '.php' extensions
RewriteCond %{THE_REQUEST} /([^.]+)\.php [NC]
RewriteRule ^ /%1 [NC,L,R]
RewriteCond %{REQUEST_FILENAME}.php -f
RewriteRule ^ %{REQUEST_URI}.php [NC,L]
```

## API Document

### Get a random picture

`[GET] api/random.php`
- Request: 
  - Parameters: 
    - require: **GET optional** `string`  
      The background picture requirement, it can be the following types:  
      - **vertical**: vertical picture(aspect ratio is less than 1)  
      - **horizontal**: horizontal picture(aspect ratio is greater than 1)  
    
      If the parameter is not specified, it will randomly select one of all pictures.
- Response: `image/*`  
  The image file

```http request
GET /api/random?type=vertical HTTP/1.1
Host: localhost
Accept: image/*
Authorization: Basic YWRtaW46YWRtaW4=
```

### Get the information of the current picture

`[GET] api/current.php`
- Request:
  - No parameters
- Response: `application/json`  
  The information of the current picture. The object contains the following properties:
  - path: `string`  
    The path of the current picture(relative to the root directory(not the site root directory))
  - width: `int`  
  - height: `int`  
  - mime: `string`  
  - url: `string`  
  - copyright: `string`  
    The copyright information of the current picture

### Get the current picture or a background picture by the given path

`[GET] api/get.php`
- Request:
  - Parameters:
    - path: **GET optional** `string`  
      The path(file name) of the picture
- Response: `image/*`
    The image file
