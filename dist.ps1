if (Test-Path -Path "dist/background.min.js")
{
    Remove-Item -Path "dist/background.min.js" -Force
}
if (Test-Path -Path "dist/background.min.css")
{
    Remove-Item -Path "dist/background.min.css" -Force
}
minify src/background.js > dist/background.min.js
minify src/background.css > dist/background.min.css
