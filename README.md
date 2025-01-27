#  \<simple-image-adjust></simple-image-adjust>
A simple web component to scale and reposition an image on the web.

# Getting Started
In essence, the component a `HTMLCanvasElement` with some functionality.

1. Import the JS, and use it in the markup, but its not ready yet.
    ```html
      <script src="/simple-image-adjust.js"></script>
      <simple-image-adjust src="path/to/image.jpg" edit-mode></simple-image-adjust>
    ```
  While `src` attribute is similar to `Image`, the component renders the image at the centre of a canvas.
  The `edit-mode` attribute enables moving and scaling the images around, and renders a few control buttons on screen.
1. You can set some others properties to layout the image. See more at [# Attributes]("#attributes")
    ```html
      <simple-image-adjust
        src="path/to/image.jpg"
        offsetX="42"
        offsetT="37"
        zoom="3.142"
        edit-mode
      ></simple-image-adjust>
    ```

# Attributes
### **src**: string
Fetches and renders the image to be layout.
### **offsetX**: number
Optional. Horizontal offset of the image. Changes when the image is moved around too.
### **offsetY**: number
Optional. Vertical offset of the image. Changes when the image is moved around too.
### **zoom**: number
Optional. The zoom amount with 1 being the default 100% zoom.
### **editMode**: boolean
Boolean where it disables layout editing. Usually set or unset after layout is done.

