# zlui-ts README

## Brief Description

  `zlui-ts` is a TypeScript UI library for creating modern graphical user interfaces.

  Here are the key takeaways:

   * Core UI System: The file defines the foundational classes and logic for a UI framework. The
     central class appears to be zlUIWin, which represents a window or a UI element and can contain
     other elements in a hierarchical structure.
   * UI Components: It includes definitions for common UI elements such as panels, buttons,
     checkboxes, combo boxes, and edit fields.
   * Layout and Styling: The library has a comprehensive system for positioning and sizing elements,
     including features like alignment, anchoring, docking, arrangment, and autosizing. It also handles colors,
     transparency (alpha), and transformations (scaling, rotation).
   * Backend Abstraction: It's designed to be backend-agnostic. It defines interfaces (IBackend,
     IFont, ITexture) that a rendering backend must implement. This means the UI can be rendered in
     different environments (like the browser DOM `BackendDOM.ts` or a native ImGui application `BackendImGui.ts`) by providing a
     suitable backend.
   * Text-based UI Definition: The presence of a Parser class and numerous Parse... functions
     strongly suggests that UIs can be defined using a custom text format, which the library then
     parses to create the UI tree.
   * Vector Math: It includes its own set of math classes for vectors and matrices (Vec2, Vec4,
     Mat2, Transform), which are essential for graphics and UI positioning.

  In summary, zlui-ts is a versatile and extensible UI library with a focus on a declarative,
  text-based approach to defining user interfaces and the ability to be rendered on different
  platforms through its backend system.

<img src="https://zhobo63.github.io/zlui/zlui-5-ed5913f66.gif">

## Requirements

zlUI system rendering base on @zhobo63\imgui-ts

```ts
import {ImGui, ImGui_Impl} from '@zhobo63/imgui-ts';
import { zlUIMgr } from './zlUI';

let ui:zlUIMgr;

function _loop(time:number):void {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    //Rendering
    let io=ImGui.GetIO();
    ui.any_pointer_down=(!ImGui.GetHoveredWindow())?ImGui_Impl.any_pointerdown():false;
    ui.mouse_pos=io.MousePos;
    ui.mouse_wheel=io.MouseWheel;
    ui.Refresh(io.DeltaTime);
    ui.Paint(ImGui.GetBackgroundDrawList());        

    ImGui.EndFrame();
    ImGui.Render();

    ImGui_Impl.ClearBuffer(backgroundColor);
    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
    window.requestAnimationFrame(_loop);
}

window.addEventListener('DOMContentLoaded', async () =>{
    await ImGui.default();
    ImGui.CHECKVERSION();
    ImGui.CreateContext();

    const canvas:HTMLCanvasElement=document.getElementById('canvas') as HTMLCanvasElement;
    ImGui_Impl.Init(canvas);

    //initialize & load resources
    ui=new zlUIMgr;
    await this.ui.Load("main.ui", "res/");

    window.requestAnimationFrame(_loop);
});

```

## Known Issues

- ImTransform when rotate or scale
    * Edit Box
    * Clip Rect 
- Transform is only available for BackendImGui

## Update History

- 0.1.40
    zlUIParticle
        [TODO] Emitter
        Controller
        Force

- 0.1.22

    Drag Drop
```ts
    DragDrop true   //enable drag drop
    DragType number //source object can drop only DragType match DropType of target object
    DropType number
```

<video autoplay loop src="https://zhobo63.github.io/zlui/screen-recorder-tue-jul-02-2024-11-25-40.webm" type="video/webm" width="80%"></video>

- 0.1.20  

    UITreeNode   offset_x

    UITree       defaultTreeNode

- 0.1.19 UITree

- 0.1.12 Hint 

- 0.1.6 Rotate scale and alpha animation

<img src="https://zhobo63.github.io/zlui/zlui-5-ed5913f65.gif">

## UI Definition

### Base Properties (`zlUIWin`)
These properties are available for **every** UI component as they are part of the base class.

*   **`name <string>`**: Assigns a unique identifier.
*   **`rectwh <x> <y> <width> <height>`**: Sets position and dimensions in one line.
*   **`x <number>` / `left <number>`**: Sets the X coordinate.
*   **`y <number>` / `top <number>`**: Sets the Y coordinate.
*   **`w <number>` / `width <number>`**: Sets the width.
*   **`h <number>` / `height <number>`**: Sets the height.
*   **`align <type>`**: Aligns the component within its parent.
    *   `type`: `none`, `left`, `top`, `right`, `down`, `center`, `centerw`, `centerh`, `centertop`, `centerdown`, `righttop`, `rightdown`, `lefttop`, `leftdown`, `parentwidth`, `parentheight`, `textwidth`, `textheight`, `textsize`.
*   **`visible <bool>`**: Toggles visibility (`true`, `false`, `yes`, `no`, `1`, `0`).
*   **`enable <bool>`**: Toggles if the component is interactive (`true`, `false`).
*   **`disable <bool>`**: An alias for setting `enable` to `false`.
*   **`notify <bool>`**: Toggles if the component can be targeted by mouse events.
*   **`resize <bool>` / `resizable <bool>`**: Allows the component to be resized by dragging.
*   **`drag <bool>` / `dragable <bool>`**: Allows the component to be moved by dragging.
*   **`autosize <mode>`**: Automatically adjusts size based on child or text content.
    *   `mode`: `none`, `width`, `height`, `all`, `size`, `textwidth`, `textheight`, `textsize`.
*   **`autoheight <bool>`**: Alias for `autosize height`.
*   **`padding <number>`**: Sets internal padding space.
*   **`margin <x> <y>`**: Sets external margin for layout purposes (e.g., in an `arrange content` container).
*   **`content_margin <x> <y>`**: Sets spacing between child elements in an `arrange content` container.
*   **`clip <bool>`**: Enables clipping of child elements that render outside this component's bounds.
*   **`anchor <mode> <x_ratio> <y_ratio>`**: Anchors the component relative to its parent's size using a ratio (0.0 to 1.0).
    *   `mode`: `x`, `y`, `xy`, `all`.
*   **`dock <mode> <left> <top> <right> <bottom>`**: Docks the component to parent edges using percentage-based coordinates (0.0 to 1.0).
    *   `mode`: `left`, `top`, `right`, `down`, `all`.
*   **`dockoffset <l> <t> <r> <b>`**: Adds a fixed pixel offset to the `dock` property.
*   **`offset <x> <y>`**: Applies a fixed pixel offset to the component's final position.
*   **`arrange <direction> <mode> [...]`**: Arranges child components.
    *   `direction`: `horizon`, `vertical`.
    *   `mode`: `item`, `content`, `row`. For `item` mode, additional parameters are `item_per_row` and `item_size`.
*   **`hint <string>`**: Sets a tooltip text to show on hover.
*   **`alpha <float>`**: Sets transparency (0.0 to 1.0).
*   **`rotate <degrees>`**: Rotates the component around its origin.
*   **`scale <float>`**: Scales the component from its origin.
*   **`origin <x_ratio> <y_ratio>`**: Sets the rotation/scaling origin as a ratio of the component's size (0.0 to 1.0). Default is `0.5 0.5` (center).
*   **`originoffset <x> <y>`**: Applies a fixed pixel offset to the origin.
*   **`dragdrop <bool>`**: Enables the component as a source for drag-and-drop operations.
*   **`dragtype <integer>`**: An integer ID for the type of item being dragged.
*   **`droptype <integer>`**: An integer ID that determines what `dragtype` this component can accept.

---

### Component-Specific Properties

#### `Image` (`zlUIImage`)
*Inherits from `zlUIWin`.*
*   **`image <texture_name>`**: Specifies the image to display from a loaded texture pack.
*   **`color <color_value>`**: Sets a solid background color (e.g., `0xffrrggbbaa`, `rgb(r,g,b)`).
*   **`rounding <number>`**: Radius for rounded corners.
*   **`roundingcorner <flags>`**: Specifies which corners to round.
    *   `flags`: `none`, `topleft`, `topright`, `botleft`, `botright`, `top`, `bot`, `left`, `right`, `all`.

#### `Panel` (`zlUIPanel`)
*Inherits from `zlUIImage`.*
*   **`text <string>`**: Sets the display text.
*   **`textcolor <color_value>`**: Sets the text color.
*   **`textcolorhover <color_value>`**: Sets the text color on mouse hover.
*   **`colorhover <color_value>`**: Sets the panel's background color on hover.
*   **`color4 <c1> <c2> <c3> <c4>`**: Sets a gradient with four colors for the background.
*   **`colorhover4 <c1> <c2> <c3> <c4>`**: Sets a four-color gradient for the hover state.
*   **`font <font_index>`**: Specifies which loaded font to use by its integer index.
*   **`textalignw <align>`**: Horizontal text alignment (`left`, `center`, `right`).
*   **`textalignh <align>`**: Vertical text alignment (`top`, `center`, `down`).
*   **`textanchor <mode> <x> <y>`**: Fine-grained text positioning using ratios.
*   **`textoffset <x> <y>`**: Applies a fixed pixel offset to the text position.
*   **`multiline <bool>`**: Allows text to wrap to the next line.
*   **`drawclient <bool>`**: Toggles drawing of the main background/image.
*   **`drawborder <bool>`**: Toggles drawing of the border.
*   **`borderwidth <number>`**: Sets the border width in pixels.
*   **`bordercolor <color_value>`**: Sets the border color.
*   **`board <texture> <x1> <y1> <x2> <y2>`**: Defines a 9-patch style border using a texture region.

#### `Button` (`zlUIButton`)
*Inherits from `zlUIPanel`.*
*   **`board <...>`**: Sets the 9-patch board for all states (up, down, hover).
*   **`boardup <...>`, `boarddown <...>`, `boardhover <...>`**: State-specific 9-patch boards.
*   **`color <...>`**: Sets the background color for all states.
*   **`colorup <...>`, `colordown <...>`, `colorhover <...>`, `colordisable <...>`**: State-specific background colors.
*   **`color4 <...>`, `colordown4 <...>`, `colorup4 <...>`**: State-specific 4-color gradients.
*   **`textcolor <...>`**: Sets the text color for all states.
*   **`textcolorup <...>`, `textcolordown <...>`, `textcolorhover <...>`, `textcolordisable <...>`**: State-specific text colors.
*   **`image <...>`**: Sets the image for all states.
*   **`imagedown <...>`, `imagehover <...>`, `imageup <...>`**: State-specific images.
*   **`drawbutton <bool>`**: If `false`, disables the automatic state-change appearance logic.

#### `Check` (`zlUICheck`)
*Inherits from `zlUIButton`.*
*   **`drawcheck <bool>`**: If `true` (default), draws a visual checkmark graphic when checked.
*   **`checktext <checked_string> <unchecked_string>`**: Sets the text to display for the checked and unchecked states respectively.

#### `Combo` (`zlUICombo`)
*Inherits from `zlUIButton`.*
*   **`comboitems <item1> <item2> ...`**: A space-separated list of strings for the dropdown menu.
*   **`combovalue <index>`**: Sets the initially selected item by its index.
*   **`popupwidth <number>`**: Overrides the width of the dropdown popup.
*   **`maxpopupitems <number>`**: Sets the maximum number of items visible in the popup before a scrollbar appears.

#### `Edit` (`zlUIEdit`)
*Inherits from `zlUIPanel`.*
*   **`type <string>`**: Sets the input type. Common values are `text`, `number`, and `password`. Also supports standard HTML input types like `file`.
*   **`password <char>`**: A shortcut to set `type` to `password` and define the masking character.
*   **`maxlength <number>`**: Sets the maximum number of characters allowed in the input field.
*   **`accept <string>`**: For `type file`, specifies the accepted file types (e.g., `".png, .jpg"`).

#### `Slider` (`zlUISlider`)
*Inherits from `zlUIPanel`.*
*   **`direction <type>`**: Sets the scroll direction: `vertical` (default), `horizon`, or `both`.
*   **`itemmode <bool>`**: If true, scrolling snaps to discrete item sizes instead of being continuous.
*   **`mousewheelspeed <float>`**: Controls the sensitivity of mouse wheel scrolling.
*   **`scrollbarcolor <color_value>`**: Sets the color of the scrollbar thumb.
*   **`scrollbarcolor4 <c1>...<c4>`**: Sets a 4-color gradient for the scrollbar thumb.
*   **`scrollbarcolorhover <color_value>`**: Sets the scrollbar color on mouse hover.
*   **`scrollbarcolorhover4 <c1>...<c4>`**: Sets a 4-color gradient for the scrollbar on hover.

#### `ImageText` (`zlUIImageText`)
*Inherits from `zlUIWin`.*
*   **`text <string>`**: The text to render using the image font.
*   **`color <color_value>`**: Tints the character images.
*   **`fontspace <number>`**: Sets the horizontal spacing between characters.
*   **`textalignw`/`textalignh`/`textanchor`**: Used for positioning the block of text within the component's bounds.
*   **`ascii <char> <image_index>`**: Maps a character to a pre-defined image index.
*   **`imagelist <tex> <w> <h> <off_x> <off_y>`**: Defines a single character image from a texture.
*   **`imagew <tex> <w> <h> <count>`**: Defines a row of character images by slicing a texture horizontally.
*   **`imageh <tex> <w> <h> <count>`**: Defines a column of character images by slicing a texture vertically.

#### `Tree` (`zlUITree`)
*Inherits from `zlUISlider`.*
*   **`singleselect <bool>`**: If `true`, only one tree node can be selected at a time.
*   **`treenode <text>`**: Starts a block defining a new top-level tree node.
*   **`defaulttreenode <name>`**: Specifies a pre-defined `TreeNode` object to use as a template for all nodes in this tree.

#### `EditItem` (`zlUIEditItem`)
*Inherits from `zlUIPanel`.* A composite control with a label and one or more editable values.
*   **`label <string>`**: The text label for the item.
*   **`labelwidth <number>`**: The width reserved for the label text.
*   **`value <val1> <val2> ...`**: The initial value(s) for the editable fields.
*   **`type <string>`**: The type of editor to use: `text`, `number`, `range`, `checkbox`, `combo`, `file`.
*   **`items <item1> <item2> ...`**: A list of strings for the `combo` type.
*   **`range <min> <max> <step>`**: Defines the min, max, and step values for the `range` type.

#### `Particle` (`zlUIParticle`)
*Inherits from `zlUIWin`.* An emitter for a particle system.
*   **`image <texture_name>`**: The texture to use for each particle.
*   **`particlecount <number>`**: The maximum number of particles.
*   **`timestart <sec>` / `timeend <sec>`**: The start and end time of the emission loop.
*   **`speed <val>` / `speedvar <val>`**: The initial speed and variance of particles.
*   **`life <sec>` / `lifevar <sec>`**: The lifetime and variance of particles.
*   **`dir <deg>` / `dirvar <deg>`**: The emission direction and variance in degrees.
*   **`size <px>` / `sizevar <px>`**: The initial size and variance of particles.
*   **`rot <deg>` / `rotvar <deg>`**: The initial rotation and variance.
*   **`mass <val>` / `massvar <val>`**: The mass and variance, used by forces.
*   **`color <c1> <c2> ...`**: A series of colors the particle will transition through over its life.
*   **`shape <type>`**: The shape of the particle quad (`rect` or `quad`).
*   **`blend <src> <dst>`**: The blend mode (e.g., `srcalpha invsrcalpha` for alpha blending, `one one` for additive).
*   **`force <type> [...]`**: Applies a force to the particles (e.g., `force gravity 100 100 9.8`).
*   **`source <name>`**: Uses a UI object as the particle's visual instead of a simple image.

### zlui-ts ui file format

```ts
////////////////////////////////
// global function
////////////////////////////////

DefaultScreenSize width height  

/*
color:  RGB(r,g,b) with alpha=255, r,g,b value range=0~255
        RGBA(r,g,b,a)
        0xff000000 with hex abgr
*/
DefaultPanelColor color

//file.txt format see #Pack Image format
//there can be multiple pack image files
LoadPackImage file1.txt
LoadPackImage file2.txt

include file.ui

/*
When combo popup, you can select default combo popup theme,
Menu must be Slider Object
Item must be Button Object
*/
DefaultComboMenu name
DefaultComboItem name

/*
we can create custom fontName from url like:
document.fonts.add(fontFace);
*/
CreateFont fontName url

/*
define font id:
Font 0 Arial 16 bold
Font 1 Arial 24 bold
when in panel, you can
Object Panel
{
    Font 0  //for arial 16    
    Text i am a panel
}
Object Panel
{
    Font 1  //for arial 24
    Text i am a panel
}
*/
Font id fontName fontSize style

/*
merge font to previously font id,
when codeStart<=charcode<=codeEnd, this font is used:
MergeFont 0 \uf000 \uffff Fontawesome 16 normal
*/
MergeFont id codeStart codeEnd fontName fontSize style

/*
name: TrackGroup name
loop: -1 for loop
      >0 for play times  
*/
PlayTrack name loop

////////////////////////////////
// Structure
////////////////////////////////

Object Panel
{
    // child object
    Object Button
    {
        Name btn_ok   

        Object Panel
        {
            Name pnl_icon
        }
    }

    // clone previous object by name
    Clone btn_ok
    {

        // set child parameter by name
        Param pnl_icon
        {

        }
    }

    // object array
    Object[3] Panel
    {
        // create 3 panels names: pnl[0], pnl[1], pnl[2]
        Name pnl

        +X number   //
        +Y number   //
    }

    // clone array by name
    Clone[3] pnl_icon
    {
        // clone 3 panels from pnl_icon
        // name: pnl_header[0], pnl_header[1], pnl_header[2]
        Name pnl_header 
    }
}
```

```cpp
////////////////////////////////
// Object Type
////////////////////////////////

// Win

Object Win
{
    //parameter
    Name win_name

    RectWH x y width height
    Top y
    Y y

    Left x
    X x

    Width w
    W w

    Height h
    H h

    /*
    mode: none, left, top, right, down, center
        centerW,
        centerH,
        centerTop,
        centerDown,
        centerLeft,
        centerRight,
        rightTop, rightDown, leftTop, leftDown,
        parentWidth, 
        parentHeight,
        textWidth,
        textHeight,
        textSize
    */
    Align mode

    /*
    bool: true yes 1
          false no 0
    */
    Visible bool

    Notify bool

    Drag bool

    /*
    used in Object[] Clone[]
    */
    +X
    +Y

    //auto set size width/height to contain all children
    //mode: width|height|all
    Autosize mode

    //equal to Autosize Height
    AutoHeight

    //child's ahchor,dock start with parent's padding
    Padding number

    /*
    auto adjust x or y to parent's size(inside padding),
    for x: value is 0~1 means 0:left, 1:right, 0.5:center
    for y: value is 0~1 means 0:top, 1:down, 0.5:center
    mode: x, y, xy, all
    xy=all
    */
    Anchor mode x y

    /*
    auto adjust rect to parent's size(inside padding)
    mode: left, top, right, down, all
    can use | to combin, ex:left|right
    */
    Dock mode left top right bottom

    /*
    offset x or y in px to anchor position
    */
    Offset x y

    /*
    when true children can only drawing inside parent.
    */
    Clip bool

    /*
    arrange children position 
    direction: horizon, vertical
    mode: item, content
    item mode:
        Arrange vertical item 5 (100,50)
    content mode: 
        Arrange horizontal content
    */
    Arrange direction mode [itemPerRow] [itemSize.x, itemSize.y]

    //TODO
    Hint

    /*
    when arrange children, next child start with margin space
    */
    Margin x y

    // if ui contain name do the command
    if name do

    // if ui not contain name do the command
    ifnot name do
}

// Image extend Win

Object Image
{
    //name: SubImage name, see #Pack Image
    Image name

    Color color
}

// Panel extend Image

Object Panel
{
    //is draw background panel
    DrawClient bool

    //is draw border frame
    DrawBorder bool

    BorderWidth number

    BorderColor color

    HoverColor color

    //rounding corner radius
    Rounding number

    /*
    mode: none, topLeft, topRight, downLeft, downRight,
        top, down, left, right, all
    */
    RoundingCorner mode

    Text string

    /*
    mode: left, right, center
    */
    TextAlignW mode

    /*
    mode: top, down, center
    */
    TextAlignH mode

    TextColor color
    TextColorHover color

    //default id is 0
    Font id

    /*
    9-grid rendering
    image: SubImage name see #Pack Image
    */
    Board x1 y1 x2 y2 image

    Multiline bool

    /*
    text position in panel
    mode: x, y, xy
    x: float 0~1
    y: float 0~1
    */
    TextAnchor mode x y

    //text offset in px from TextAnchor
    TextOffset x y
}

// Edit extend Panel

Object Edit
{
    Password char

    MaxLength number
}

// Button extend Panel

Object Button
{
    BoardDown

    Board

    BoardUp

    BoardHover

    Color color

    ColorDown color

    ColorHover color

    ColorDisable color

    TextColor color

    TextColorDown color

    TextColorUp color

    Image name

    ImageDown name

    ImageHover name

    //if not DrawButton only draw text
    DrawButton bool
}

// Check extend Button

Object Check
{
    //is draw default check mark
    DrawCheck bool

    //if is checked use string1 or use string2
    CheckText string1 string2
}

// Combo extend Button

Object Combo
{
    //default combo items
    ComboItems string1 string2 ...

    //default combo value
    ComboValue number
}

// Slider extend Panel

Object Slider
{
    /*
    type: horizon, vertical, both
    */
    Direction type

    /*
    if ItemMode, slider will not change position of children
    else slider will change positions of children
    */
    ItemMode bool

    //default 20
    MouseWheelSpeed number
}

//ImageText extend Win
Object ImageText
{
    //name: SubImage name, see #Pack Image
    ImageList name width height offsetx offsety

    //horizontal split image by count, each size is (width, height)
    ImageW name width height count

    //vertical split image by count, each size is (width, height)
    ImageH name width height count

    Text string

    //imageIndex is the index of the ImageList
    Ascii char imageIndex

    //mode: left, center, right
    TextAlignW mode

    //mode: top, center, down
    TextAlignH mode

    //x:0~1, y:0~1
    TextAnchor x y

    FontSpace number
}

```

```cpp
////////////////////////////////
// Track Animation System
////////////////////////////////

// Structure

TrackGroup name
{
    //name: must be the name of ui object 
    Track name
    {
        /*
        time1,time2 unit is 1/30 second
        so time=30 equal to 1 second

        command with only time1:
        the command is fired when the time1 reached

        command with time1 and time2:
        the command is take effect between time1 and time2
        */

        SetPos time1 x y
        SetRect time1 left top right buttom
        SetWidth time1 width
        SetHeight time1 height
        Move time1 time2 x y
        MoveLerp time1 time2 x y speed

        /*
        bezier control points must be 4 coordinates on one set
        4, 8, 16,... is valid coordinates count
        */
        MoveBezier time1 time2 (x,y) (x,y) (x,y) (x,y)

        SetX time1 x
        MoveX time1 time2 x
        MoveXLerp time1 time2 x speed
        SetY time1 y
        MoveY time1 time2 y
        MoveYLerp time1 time2 y speed

        SetScale time1 scale
        Scale time1 time2 scale
        ScaleLerp time1 time2 scale speed

        Image time1 name

        //alpha = 0 ~ 255
        SetAlpha time1 alpha
        Alpha time1 time2 alpha
        AlphaLerp time1 time2 alpha speed

        Hide time1
        Show time1

        //TODO
        FlipW time1
        FlipH time1

        //rotate is angle (degree)
        SetRotate time1 rotate
        Rotate time1 time2 rotate
        RotateLerp time1 time2 rotate speed

        //color can be: RGB(r,g,b) or RGBA(r,g,b,a) or 0xffffffff 
        SetColor time1 color
        Color time1 time2 color
        ColorLerp time1 time2 color speed

        Width time1 time2 width
        WidthLerp time1 time2 width speed

        Height time1 time2 height
        HeightLerp time1 time2 height speed

        //TODO zlUIAni
        StopAni time1
        PlayAni time1
        AniSpeed time1
        AniStartEnd time1

        //TODO
        PlaySound
        SoundFade
        Volume

        //TODO zlUIAni
        SetImageClip
        ImageClip
        ImageClipLerp

        //name: TrackGroup name
        PlayTrack time1 name loop

        //name: TrackGroup name
        StopTrack time1 name

        Enable time1
        Disable time1

        Text time1 string
    }
}


```

### Pack Image format

```cpp
////////////////////////////////
// packimage.txt
////////////////////////////////

//file: (url)
Image file

//there can be more than one SubImage in the pack image
//
SubImage name left top right buttom
```