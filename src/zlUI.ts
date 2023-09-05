import { ImGui, ImGui_Impl } from "@zhobo63/imgui-ts";
import { ImDrawList, ImVec2 } from "@zhobo63/imgui-ts/src/imgui";
import { EType, GetInput, Input } from "@zhobo63/imgui-ts/src/input";

export const Version="0.1.4";

export let Use_ImTransform=true;
//export let Use_ImTransform=false;

/*
TODO
TrackGroup
Hint

///////////////////////////////////
/// zlUIWin 
///////////////////////////////////

///////////////////////////////////
/// zlUIImage extends zlUIWin 
///////////////////////////////////

///////////////////////////////////
/// zlUIPanel extends zlUIImage 
///////////////////////////////////

///////////////////////////////////
/// zlUIEdit extends zlUIPanel 
///////////////////////////////////

///////////////////////////////////
/// zlUIButton extends zlUIPanel 
///////////////////////////////////

///////////////////////////////////
/// zlUICheck extends zlUIButton
///////////////////////////////////

///////////////////////////////////
/// zlUICombo extends zlUIButton
///////////////////////////////////

///////////////////////////////////
/// zlUISlider extends zlUIPanel 
///////////////////////////////////

///////////////////////////////////
/// zlUIImageText extends zlUIWin
///////////////////////////////////

///////////////////////////////////
/// zlTexturePack
///////////////////////////////////

///////////////////////////////////
/// zlTrack
///////////////////////////////////

///////////////////////////////////
/// zlTrackGroup
///////////////////////////////////

///////////////////////////////////
/// zlTrackMgr
///////////////////////////////////

///////////////////////////////////
/// zlUIMgr extends zlUIWin
///////////////////////////////////

    on_click
    on_edit
    on_popup_closed

    # 建立字型 
    # fontstyle=css font property, values:normal, italic, oblique, bold, bolder, lighter
    Font id fontname fontsize fontstyle

    # 合併字形
    # 合併字形到id, id必須先建立第一個字形
    # 字碼從start到end區間使用此字形
    MergeFont id start end fontname fontsize fontstyle

    # 預設視窗長寬
    # 如果使用ScaleWH 將以此大小為縮放依據
    DefaultScreenSize width height

    DefaultPanelColor color

    # 載入檔案
    include file.ui

    # 預設Combo彈出物件
    # Menu必須為zlUISlider元件, Item必須為zlUIButton元件
    DefaultComboMenu name
    DefaultComboItem name

    # 載入包圖
    LoadPackImage file.txt
    
*/

export interface OnLoadable
{
    onload:any;
    onerror:any;
}

export function LoadImage<T extends OnLoadable>(src:T):Promise<T>
{
    return new Promise((resolve, reject)=>{
        src.onload=()=>resolve(src);
        src.onerror=reject;
    });
}

export function Panel(win:zlUIWin, text:string, child?:string):zlUIPanel
{
    let obj:zlUIPanel=(child?win.GetUI(child):win) as zlUIPanel;
    obj.SetText(text);
    return obj;
}

export function Edit(win:zlUIWin, text:string, on_change:(txt:string)=>any, child?:string):zlUIEdit
{
    let obj:zlUIEdit=(child?win.GetUI(child):win) as zlUIEdit;
    obj.SetText(text);
    obj.on_change=on_change;
    return obj;
}

export function Button(win:zlUIWin, text:string, on_click:()=>any, child?:string):zlUIButton
{
    let obj:zlUIButton=(child?win.GetUI(child):win) as zlUIButton;
    obj.SetText(text);
    obj.on_click=on_click;
    return obj;
}

export function Check(win:zlUIWin, checked:boolean,on_check:(chk:boolean)=>any, child?:string):zlUICheck
{
    let obj:zlUICheck=(child?win.GetUI(child):win) as zlUICheck;
    obj.isChecked=checked;
    if(obj.check_text) {
        obj.SetText(checked?obj.check_text[0]:obj.check_text[1]);
    }
    obj.on_check=on_check;
    return obj;
}

export function Combo(win:zlUIWin, value:number, items:string[], on_combo:(v:number)=>any, child?:string):zlUICombo
{
    let obj:zlUICombo=(child?win.GetUI(child):win) as zlUICombo;
    obj.Combo(value, items, on_combo);
    return obj;
}

export function Inside(pos:ImGui.ImVec2, min:ImGui.ImVec2, max:ImGui.ImVec2):boolean
{
   return (pos.x>=min.x&&pos.x<=max.x&&pos.y>=min.y&&pos.y<=max.y)?true:false;
}

export function stringToColorHex(color:string):number
{
    let c=0;
    for(let i=0;i<color.length;i++) {
        let ci=color.charCodeAt(i);
        let s=0;
        if(ci>=48&&ci<=57) {
            s=ci-48;
        } else if(ci>=65&&ci<=70) {
            s=10+ci-65;
        } else if(ci>=97&&ci<=102) {
            s=10+ci-97;
        }
        c=(c<<4)+s;
    }
    return c;
}

export function toColorHex(c:Vec4):number
{
    let r=Math.floor(c.x*255);
    let g=Math.floor(c.y*255);
    let b=Math.floor(c.z*255);
    let a=Math.floor(c.w*255);
    return (a<<24)|(b<<16)|(g<<8)|r;
}
export function fromColorHex(c:number):Vec4
{
    let r=(c&0x000000ff)/255;
    let g=((c&0x0000ff00)>>8)/255;
    let b=((c&0x00ff0000)>>16)/255;
    let a=((c&0xff000000)>>24)/255;
    return {x:r,y:g,z:b,w:a};
}

export function ParseBool(tok:string):boolean
{
    let b:boolean=true;
    switch(tok) {
    case 'false':
    case 'no':
        b=false;
        break;
    case 'true':
    case 'yes':
        break;
    default:
        if(Number.parseInt(tok) == 0)   {
            b=false;
        }
        break;
    }
    return b;
}

export function ParseText(s:string):string
{
    let r=/\\u([\d\w]{4})/gi;
    s = s.replace(r, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16)); } );    
    s=s.replace(/\\n/g, "\n");
    s=s.replace(/\\s/g," ");
    return s;
}

export function ParseColor(s:string):number
{
    let c:number=0xffffffff;
    if(s.startsWith("rgba"))    {
        let toks=s.split(/\(|\)/);
        toks=toks[1].split(",");
        c= Number.parseInt(toks[0])|
        (Number.parseInt(toks[1])<<8)|
        (Number.parseInt(toks[2])<<16)|
        (Number.parseInt(toks[3])<<24);

    }else if(s.startsWith("rgb"))    {
        let toks=s.split(/\(|\)/);
        toks=toks[1].split(",");
        c=Number.parseInt(toks[0])|
        (Number.parseInt(toks[1])<<8)|
        (Number.parseInt(toks[2])<<16)|
        (255<<24);
    }else if(s.match(/0x[A-Fa-f0-9]{8}/g))    {
        c=stringToColorHex(s.slice(2));
    }
    else {
        c=Number.parseInt(s);
    }
    return new Uint32Array([c])[0];
}

export enum Align
{
    None,
    Left, 
    Top, 
    Right,
    Down, 
    Center,
    CenterW,
    CenterH,
    CenterTop,
    CenterDown,
    CenterLeft,
    CenterRight,
    RightTop,
    RightDown,
    LeftTop,
    LeftDown,
    ParentWidth,
    ParentHeight,
    TextWidth,
    TextHeight,
    TextSize,
}

function ParseAlign(tok:string):Align
{
    switch(tok) {
    case 'none':
        return Align.None;
    case 'left':
        return Align.Left;
    case 'top':
        return Align.Top;
    case 'right':
        return Align.Right;
    case 'down':
    case 'bottom':
        return Align.Down;
    case 'center':
        return Align.Center;
    case 'centerw':
        return Align.CenterW;
    case 'centerh':
        return Align.CenterH;
    case 'centertop':
        return Align.CenterTop;
    case 'centerdown':
        return Align.CenterDown;
    case 'centerleft':
        return Align.CenterLeft;
    case 'centerright':
        return Align.CenterRight;
    case 'righttop':
        return Align.RightTop;
    case 'rightdown':
        return Align.RightDown;
    case 'lefttop':
        return Align.LeftTop;
    case 'leftdown':
        return Align.LeftDown;
    case 'parentwidth':
        return Align.ParentWidth;
    case 'parentheight':
        return Align.ParentHeight;
    case 'textwidth':
        return Align.TextWidth;
    case 'textheight':
        return Align.TextHeight;
    case 'textsize':
        return Align.TextSize;
    }
    return Align.None;
}

export enum EAutosize
{
    None,
    Width,
    Height,
    All,
}

function ParseAutosize(tok:string):EAutosize
{
    switch(tok) {
    case "width":
        return EAutosize.Width;
    case "height":
        return EAutosize.Height;
    case "all":
        return EAutosize.All;
    }
    return EAutosize.Height;
}

export interface IAutosize
{
    mode:EAutosize;
}

function ParseSliderType(tok:string):ESliderType
{
    switch (tok) {
    case 'horizon':
        return ESliderType.eHorizontal;
    case 'vertical':
        return ESliderType.eVertical;
    case 'both':
        return ESliderType.eBoth;
    }
    return ESliderType.eVertical;
}
function ParseCorner(tok:string):ImGui.ImDrawCornerFlags
{
    switch (tok) {
    case "none":
        return ImGui.ImDrawCornerFlags.None;
    case "topleft":
        return ImGui.ImDrawCornerFlags.TopLeft;
    case "topright":
        return ImGui.ImDrawCornerFlags.TopRight;
    case "downleft":
        return ImGui.ImDrawCornerFlags.BotLeft;
    case "downright":
        return ImGui.ImDrawCornerFlags.BotRight;
    case "top":
        return ImGui.ImDrawCornerFlags.Top;
    case "down":
        return ImGui.ImDrawCornerFlags.Bot;
    case "left":
        return ImGui.ImDrawCornerFlags.Left;
    case "right":
        return ImGui.ImDrawCornerFlags.Right;
    case "all":
        return ImGui.ImDrawCornerFlags.All;
    }
    return ImGui.ImDrawCornerFlags.None;
}


export enum ScaleMode
{
    Stretch,
    AspectRatio,
}

export interface TexturePack
{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
    texture:ImGui_Impl.Texture;
    uv1?:ImGui.Vec2;
    uv2?:ImGui.Vec2;
}

function UpdateTexturePack(image:TexturePack):TexturePack
{
    image.uv1=new ImGui.ImVec2(
        image.x1/image.texture._width,
        image.y1/image.texture._height
    )
    image.uv2=new ImGui.ImVec2(
        image.x2/image.texture._width,
        image.y2/image.texture._height
    )
    return image;
}

export interface Board
{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
    image:TexturePack;
    color?:number;
    vert?:ImGui.Vec2[];
    uv?:ImGui.Vec2[];
    visible?:boolean[];
}

function ParseBoard(toks:string[], mgr:zlUIMgr):Board
{
    let b:Board={
        x1:Number.parseInt(toks[2]),
        y1:Number.parseInt(toks[3]),
        x2:Number.parseInt(toks[4]),
        y2:Number.parseInt(toks[5]),
        image: mgr.GetTexture(toks[1]),
    }
    return b;
}

export enum EAnchor
{
    None,
    X=1,
    Y=1<<1,
    All=X|Y,
}

export interface IAnchor
{
    mode:EAnchor
    x:number
    y:number
}

function ParseAnchor(tok:string):EAnchor
{
    let mode:EAnchor=EAnchor.None;
    let toks=tok.split("|");
    for(let cmd of toks) {
        switch(cmd) {
        case "x":
            mode|=EAnchor.X;
            break;
        case "y":
            mode|=EAnchor.Y;
            break;
        case "xy":
        case "all":
            mode=EAnchor.All;
            break;
        }
    }
    return mode;
}


export enum EDock
{
    None,
    Top=1,
    Left=1<<1,
    Right=1<<2,
    Down=1<<4,

    All=Top|Left|Right|Down,
}

export interface IDock
{
    mode:EDock
    x:number
    y:number
    z:number
    w:number
}

export interface Vec2
{
    x:number
    y:number
}

function Vec2Add(a:Vec2, b:Vec2):Vec2
{
    return {x:a.x+b.x, y:a.y+b.y}
}
function Vec2Scale(v:Vec2, s:number):Vec2
{
    return {x:v.x*s, y:v.y*s}
}
function Vec2Multiply(a:Vec2, b:Vec2):Vec2
{
    return {x:a.x*b.x, y:a.y*b.y}
}

export interface Vec4
{
    x:number
    y:number
    z:number
    w:number
}

function ParseDock(tok:string):EDock
{
    let mode:EDock=EDock.None;
    let toks=tok.split("|");
    for(let cmd of toks) {
        switch(cmd) {
        case "left":
            mode|=EDock.Left;
            break;
        case "top":
            mode|=EDock.Top;
            break;
        case "right":
            mode|=EDock.Right;
            break;
        case "down":
        case "bottom":
            mode|=EDock.Down;
            break;
        case "all":
            mode=EDock.All;
            break;
        }
    }
    return mode;
}

export enum EArrange
{
    Item,
    Content,

}
export enum EDirection
{
    Vertical,
    Horizontal,
}

function ParseArrange(tok:string):EArrange
{
    switch(tok) {
    case "item":
        return EArrange.Item;
    case "content":
        return EArrange.Content;
    }
    return EArrange.Content;
}

function ParseDirection(tok:string):EDirection
{
    switch(tok) {
    case 'horizon':
        return EDirection.Horizontal;
    case 'vertical':
        return EDirection.Vertical;
    }
    return EDirection.Vertical;
}

export interface IArrange
{
    direction:EDirection;
    mode:EArrange;
    item_per_row?:number;
    item_size?:Vec2;
}


export function Clone(o:any):any
{
    if(o) {
        return JSON.parse(JSON.stringify(o));
    }
    return undefined;
}

let vec2=new ImVec2;
let vec_a=new ImVec2;
let vec_b=new ImVec2;
let vec_c=new ImVec2;

export function RenderCheckMark(drawlist:ImDrawList,x:number,y:number,col:number,sz:number)
{
    let thickness = Math.max(sz / 5.0, 1.0);
    sz -= thickness * 0.5;
    let px=x+thickness*0.25;
    let py=y+thickness*0.25;
    let third = sz / 3.0;
    let bx = px + third;
    let by = py + sz - third * 0.5;
    vec2.Set(bx - third, by - third);
    drawlist.PathLineTo(vec2);
    vec2.Set(bx,by);
    drawlist.PathLineTo(vec2);
    vec2.Set(bx + third * 2.0, by - third * 2.0)
    drawlist.PathLineTo(vec2);
    drawlist.PathStroke(col, false, thickness);
}
export function RenderArrow(drawlist:ImDrawList, pos:Vec2, color:number,dir:ImGui.ImGuiDir, size:number, scale:number)
{
    let r = size * 0.40 * scale;
    let center:Vec2 = {
        x:pos.x+size*0.5,
        y:pos.y+size*0.5*scale
    }
    let a:Vec2;
    let b:Vec2;
    let c:Vec2;
    switch (dir)
    {
    case ImGui.ImGuiDir.Up:
    case ImGui.ImGuiDir.Down:
        if (dir == ImGui.ImGuiDir.Up) r = -r;
        a = {x:0, y:0.75};
        b = {x:-0.866, y:-0.750};
        c = {x:+0.866, y:-0.750};
        break;
    case ImGui.ImGuiDir.Left:
    case ImGui.ImGuiDir.Right:
        if (dir == ImGui.ImGuiDir.Left) r = -r;
        a = {x:+0.750, y:+0.000};
        b = {x:-0.750, y:+0.866};
        c = {x:-0.750, y:-0.866};
        break;
    default:
        return;
    }
    vec_a.Set(center.x+a.x*r, center.y+a.y*r);
    vec_b.Set(center.x+b.x*r, center.y+b.y*r);
    vec_c.Set(center.x+c.x*r, center.y+c.y*r);
    drawlist.AddTriangleFilled(vec_a, vec_b, vec_c, color);
}

export class Bezier
{
    constructor()
    {

    }

    GetPoint(t:number):Vec2
    {
        if(!this.controlPoints||this.controlPoints.length==0)
            return {x:0,y:0};
        if(t>1) t=1;
        const segs=Math.floor(this.controlPoints.length/4);
        t=t*segs;
        let seg=Math.floor(t);
        if(seg>=segs) seg=segs-1;
        const f=t-seg;
        const f1=1-f;
        const seg4=seg*4;
        const p0=this.controlPoints[seg4];
        const p1=this.controlPoints[seg4+1];
        const p2=this.controlPoints[seg4+2];
        const p3=this.controlPoints[seg4+3];
        const a=f1*f1*f1;
        const b=3*f1*f1*f;
        const c=3*(f1)*f*f;
        const d=f*f*f;
        const x=a*p0.x+b*p1.x+c*p2.x+d*p3.x;
        const y=a*p0.y+b*p1.y+c*p2.y+d*p3.y;
        return {x:x,y:y};
    }

    ParseCmd(name:string, toks:string[]):boolean
    {
        this.controlPoints=[];
        if(toks[0].startsWith("(")) {
            for(let i=0;i<toks.length;i++) {
                let tok=toks[i].match(/\d*/g).filter(e=>e);
                this.controlPoints.push({x:parseFloat(tok[0]), y:parseFloat(tok[1])});
            }
        }else {
            for(let i=0;i<toks.length;i+=2) {
                this.controlPoints.push({
                    x:Number.parseFloat(toks[i]),
                    y:Number.parseFloat(toks[i+1]),
                })
            }
        }
        return this.controlPoints.length>=4;
    }

    controlPoints:Vec2[];
}

export {zlUIWin as UIWin}

export class zlUIWin
{
    constructor(own:zlUIMgr) {
        if(own) {
            this._owner=own;
        }
        this._csid="Win";
    }

    on_size: ((this:zlUIWin) => any)|null;
    on_notify: ((this: zlUIWin, obj: zlUIWin) => any) | null; 
    on_change: ((this: zlUIWin, text: string) => any) | null; 
    on_hover: ((this:zlUIWin, obj:zlUIWin) => any) | null;

    async Parse(lines:string[], start:number):Promise<number>
    {        
        let isComment=false;
        for(;start<lines.length;start++) {
            let line=lines[start];
            let toks:string[]=line.toLowerCase().split(/\s/g).filter(e=>e);
            
            if(toks.length>0)   {
                let tok=toks[0];
                let next=line.toLowerCase().indexOf(tok);
                toks.push(line.slice(next+1+tok.length));
                if(tok.startsWith('//')||tok.startsWith('#'))  {
                }
                else if(tok.startsWith("/*"))
                {
                    isComment=true;
                }
                else if(tok.startsWith("*/"))
                {
                    isComment=false;
                }
                else if(isComment)
                {
                }
                else if(tok.startsWith("object["))
                {
                    tok=tok.split("[")[1].replace("]", '');
                    let num=Number.parseInt(tok);
                    let obj=this._owner.Create(toks[1]);
                    if(obj) {
                        this.AddChild(obj);
                        start=await obj.Parse(lines, start + 1);
                        let name=obj.Name;
                        obj.Name=name+"[0]";

                        for(let i=1;i<num;i++)  {
                            let ch=obj.Clone();
                            ch.Name=name+"["+i+"]";
                            if(obj.add_x)   {
                                ch.x=obj.x+obj.add_x*i;
                            }
                            if(obj.add_y)   {
                                ch.y=obj.y+obj.add_y*i;
                            }
                            this.AddChild(ch);
                        }
                    }
                }
                else if(tok.startsWith("clone["))
                {
                    tok=tok.split("[")[1].replace("]", '');
                    let num=Number.parseInt(tok);
                    let obj=this.GetUI(toks[1]);
                    if(!obj) {
                        obj=this._owner.GetUI(toks[1]);
                    }
                    if(obj) {
                        let ch=obj.Clone();
                        start=await ch.Parse(lines, start+1);
                        let name=ch.Name;
                        this.AddChild(ch);
                        ch.Name=name+"[0]";
                        for(let i=1;i<num;i++)  {
                            let ch2=ch.Clone();
                            ch2.Name=name+"["+i+"]";
                            if(ch.add_x) {
                                ch2.x=ch.x+ch.add_x*i;
                            }
                            if(ch.add_y) {
                                ch2.y=ch.y+ch.add_y*i;
                            }
                            this.AddChild(ch2);
                        }
                    }
                }                
                else {
                    let obj:zlUIWin;
                    switch (tok) {
                    case 'object':
                        obj=this._owner.Create(toks[1]);
                        if(obj) {
                            this.AddChild(obj);
                            start=await obj.Parse(lines, start + 1);
                        }
                        break;
                    case 'clone':
                        obj=this.GetUI(toks[1])
                        if(!obj) {
                            obj=this._owner.GetUI(toks[1])
                        }
                        if(obj) {
                            obj=obj.Clone();
                            this.AddChild(obj);
                            start=await obj.Parse(lines, start+1);
                        }else {
                            console.log("Clone " + toks[1] + " not found", this._owner)
                        }
                        break;
                    case 'param':
                        obj=this.GetUI(toks[1]);
                        if(obj) {
                            start=await obj.Parse(lines, start+1);
                        }else {
                            console.log("Param " + toks[1] + " not found")
                        }
                        break;
                    case 'trackgroup':
                        start=this._owner.track.Parse(lines, start);
                        break;
                    case '}':
                        this.ParseEnd();
                        return start;
                    default:
                        await this.ParseCmd(tok, toks);
                        break;
                    }
                }
            }
        }
        return start;
    }

    ParseEnd():void
    {

    }

    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "name":
            this.Name=toks[1];
            break;
        case "{":
            break;
        case "rectwh":
            this.x=Number.parseInt(toks[1]);
            this.y=Number.parseInt(toks[2]);
            this.w=Number.parseInt(toks[3]);
            this.h=Number.parseInt(toks[4]);
            this.isCalRect=true;
            break;
        case "top":
        case "y":
            this.y=Number.parseInt(toks[1]);
            this.isCalRect=true;
            break;
        case "left":
        case "x":
            this.x=Number.parseInt(toks[1]);
            this.isCalRect=true;
            break;
        case "width":
        case "w":
            this.w=Number.parseInt(toks[1]);
            this.isCalRect=true;
            break;
        case "height":
        case "h":
            this.h=Number.parseInt(toks[1]);
            this.isCalRect=true;
            break;
        case "align":
            this.align=ParseAlign(toks[1]);
            break;
        case "visible":
            this.isVisible=ParseBool(toks[1]);
            break;
        case "notify":
            this.isCanNotify=ParseBool(toks[1]);
            break;
        case "drag":
            this.isCanDrag=ParseBool(toks[1]);
            break;
        case "+x":
            this.add_x=Number.parseInt(toks[1]);
            break;
        case "+y":
            this.add_y=Number.parseInt(toks[1]);
            break;
        case "autosize":
            this.autosize=ParseAutosize(toks[1]);
            break;
        case "autoheight":
            this.autosize=EAutosize.Height;
            break;
        case "padding":
            this.padding=Number.parseInt(toks[1]);
            break;
        case "anchor":
            this.anchor={
                mode:ParseAnchor(toks[1]),
                x:Number.parseFloat(toks[2]),
                y:Number.parseFloat(toks[3]),
            }
            break;
        case "dock":
            this.dock={
                mode:ParseDock(toks[1]),
                x:Number.parseFloat(toks[2]),
                y:Number.parseFloat(toks[3]),
                z:Number.parseFloat(toks[4]),
                w:Number.parseFloat(toks[5]),
            }
            break;
        case "offset":
            this.offset.x=Number.parseFloat(toks[1])
            this.offset.y=Number.parseFloat(toks[2])
            break;
        case "clip":
            this.isClip=ParseBool(toks[1]);
            break;
        case "arrange":
            this.arrange={
                direction:ParseDirection(toks[1]),
                mode:ParseArrange(toks[2]),
            }
            switch(this.arrange.mode) {
            case EArrange.Item:
                this.arrange.item_per_row=Number.parseInt(toks[3]);
                if(toks[4].match(/\(\d+,\d+\)/)) {
                    let t=toks[4].split(/\(|\)|\,/g).filter(e=>e);
                    this.arrange.item_size={
                        x:Number.parseInt(t[0]),
                        y:Number.parseInt(t[1]),
                    }
                }else {
                    this.arrange.item_size={
                        x:Number.parseFloat(toks[4]),
                        y:Number.parseFloat(toks[5]),
                    }
                }
                break;
            }
            break;
        case "hint":
            this.hint=toks[1]
            break;
        case "margin":
            this.margin.x=Number.parseInt(toks[1]);
            this.margin.y=Number.parseInt(toks[2]);
            break;
        case "if":
            if(this._owner.GetUI(toks[1])) {
                await this.ParseCmd(toks[2], toks.slice(2));
            }
            break;
        case "ifnot":
            if(!this._owner.GetUI(toks[1])) {
                await this.ParseCmd(toks[2], toks.slice(2));
            }
            break;
        case "origin":
            this.origin={
                x:Number.parseFloat(toks[1]),
                y:Number.parseFloat(toks[2])
            };
            break;
        case "originoffset":
            this.originOffset={
                x:Number.parseInt(toks[1]),
                y:Number.parseInt(toks[2])
            }
            break;
        case "scale":
            this.scale=Number.parseFloat(toks[1]);
            break;
        case "rotate":
            this.rotate=Number.parseFloat(toks[1]);
            break;
        default:
            console.log("zlUIWin " + this.Name + " unknow param " + name);
            return false;
        }
        return true;
    }

    Copy(obj:zlUIWin):void
    {
        this.Name=obj.Name;
        this.isVisible=obj.isVisible;
        this.x=obj.x;
        this.y=obj.y;
        this.w=obj.w;
        this.h=obj.h;
        this.align=obj.align;
        this._csid=obj._csid;
        this.isCalRect=true;
        this.isDisable=obj.isDisable;
        this.isCanNotify=obj.isCanNotify;
        this.isCanDrag=obj.isCanDrag;
        this.isClip=obj.isClip;
        this.add_x=obj.add_x;
        this.add_y=obj.add_y;
        this.borderWidth=obj.borderWidth;
        this.padding=obj.padding;
        this.anchor=Clone(obj.anchor);
        this.dock=Clone(obj.dock);
        this.offset=Clone(obj.offset);
        this.arrange=Clone(obj.arrange);
        this.autosize=obj.autosize;
        this.hint=obj.hint;
        this.margin=Clone(obj.margin);
        this.alpha=obj.alpha;
        this.rotate=obj.rotate;
        this.scale=obj.scale;
        this.origin=Clone(obj.origin);
        this.originOffset=Clone(obj.originOffset);

        this.pChild=[];
        for(let ch of obj.pChild) {
            this.pChild.push(ch.Clone())
        }
    }

    Clone():zlUIWin
    {
        let obj=new zlUIWin(this._owner)
        obj.Copy(this);
        return obj;
    }

    Scale(s:number):void 
    {
        this.x*=s;
        this.y*=s;
        this.w*=s;
        this.h*=s;
        if(this.pChild) {
            this.pChild.forEach(obj=>{
                obj.Scale(s);
            })
        }
    }
    Stretch(sx:number, sy:number):void
    {
        this.x*=sx;
        this.y*=sy;
        this.w*=sx;
        this.h*=sy;
        if(this.pChild) {
            this.pChild.forEach(obj=>{
                obj.Stretch(sx, sy);
            })
        }
    }

    Refresh(ti:number, parent?:zlUIWin):void 
    {        
        this._owner.refresh_count++;
        if(this.autosize!=EAutosize.None)   {
            this.pChild.forEach(obj=>{            
                if(obj.isVisible) {
                    if(obj._autosize_change)    {
                        this.isCalRect=true;
                        obj._autosize_change=false;
                    }
                }
            })
        }
        
        if(this.isCalRect) {
            this._owner.calrect_count++;
            this.CalRect(parent);
        }
        let to_delete:number[]=[];

        for(let i=0;i<this.pChild.length;i++)   {
            let obj=this.pChild[i];
            if(obj.isDelete) {
                obj.isDelete=false;
                to_delete.push(i);
                continue;
            }
            if(obj.isVisible) {
                obj.Refresh(ti, this);
            }
        }
        while(to_delete&&to_delete.length>0) {
            let i=to_delete.pop() as number;
            this.pChild.splice(i,1);                
        }
    }
    IsVisible(obj:zlUIWin):boolean
    {
        let clip=this._owner.LastClipRect;
        if(clip) {
            let screenXY=obj.screenXY;
            let screenMax=obj.screenMax;
            if(screenMax.x<clip.x||screenXY.x>clip.z||
                screenMax.y<clip.y||screenXY.y>clip.w) {
                return false;
            }
        }

        if(obj.x>this.w||obj.y>this.h)
            return false;
        if(obj.x+obj.w<0||obj.y+obj.h<0)
            return false;
        return true;
    }
    SetClipRect(xy:ImVec2, max:ImVec2)
    {
        if(this.isClip) {
            if(this._clipXY.x<xy.x) {
                this._clipXY.x=xy.x;
            }
            if(this._clipXY.y<xy.y) {
                this._clipXY.y=xy.y;
            }
            if(this._clipMax.x>max.x) {
                this._clipMax.x=max.x;
            }
            if(this._clipMax.y>max.y) {
                this._clipMax.y=max.y;
            }
            xy=this._clipXY;
            max=this._clipMax;
        }
        for(let ch of this.pChild) {
            ch.SetClipRect(xy, max);
        }
    }

    PaintChild(drawlist:ImGui.ImDrawList):void
    {
        if(this.isClip) {
            drawlist.PushClipRect(this._clipXY, this._clipMax);
            this._owner.clip_stack.push({
                x:this._clipXY.x,
                y:this._clipXY.y,
                z:this._clipMax.x,
                w:this._clipMax.y
            })
            this.SetClipRect(this._clipXY, this._clipMax);
        }
        for(let i=0;i<this.pChild.length;i++)   {
            let obj=this.pChild[i];
            if(!obj.isVisible)   {
                continue;
            }
            if(!this.IsVisible(obj))
                continue;
            obj.Paint(drawlist);
        }
        if(this.isClip) {
            this._owner.clip_stack.pop();
            drawlist.PopClipRect();
        }
    }

    Paint(drawlist:ImGui.ImDrawList):void 
    {
        this._owner.paint_count++;
        this._isPaintout=true;
        this.PaintChild(drawlist);
    }

    SetCalRect():void 
    {
        this.isCalRect=true;
        if(this.pChild) {
            this.pChild.forEach(obj=>{
                obj.SetCalRect();
            })
        }
    }

    LimitRect(ui:zlUIWin):void
    {
        if(ui.x<0)  {ui.x=0;}
        else if(ui.x+ui.w>this.w) ui.x=this.w-ui.w;
        if(ui.y<0)  {ui.y=0;}
        else if(ui.y+ui.h>this.h) ui.y=this.h-ui.h;
    }

    CalRect(parent:zlUIWin):void 
    {
        let x1=this.x;
        let y1=this.y;
        let x2=this.x+this.w;
        let y2=this.y+this.h;
        let px=0;
        let py=0;
        
        if(parent)  {
            if(parent.isCalRect)
                return;
            let padding=parent.padding;
            let alignw=Align.None;
            let alignh=Align.None;

            switch(this.align)  {
            case Align.Right:
            case Align.Left:
                alignw=this.align;
                break;
            case Align.Top:
            case Align.Down:
                alignh=this.align;
                break;
            case Align.Center:
                alignw=Align.Center;
                alignh=Align.Center;
                break;
            case Align.CenterW:
                alignw=Align.Center;
                break;
            case Align.CenterH:
                alignh=Align.Center;
                break;
            case Align.CenterDown:
                alignw=Align.Center;
                alignh=Align.Down;
                break;
            case Align.RightTop:
                alignw=Align.Right;
                alignh=Align.Top;
                break;
            case Align.RightDown:
                alignw=Align.Right;
                alignh=Align.Down;
                break;
            case Align.LeftTop:
                alignw=Align.Left;
                alignh=Align.Top;
                break;
            case Align.LeftDown:
                alignw=Align.Left;
                alignh=Align.Down;
                break;
            case Align.ParentWidth:
                alignw=Align.ParentWidth;
                break;
            case Align.ParentHeight:
                alignh=Align.ParentHeight;
                break;
            }
            switch(alignw) {
            case Align.Left:
                x1=padding;
                x2=x1+this.w;
                break;
            case Align.Center:
                x1=(parent.w-this.w)/2;
                x2=x1+this.w;
                break;
            case Align.Right:
                x1=parent.w-this.w-padding;
                x2=x1+this.w;
                break;
            case Align.ParentWidth:
                x1=padding;
                x2=parent.w-padding;
                this.w=x2-x1;
                break;
            }
            switch(alignh) {
            case Align.Top:
                y1=padding;
                y2=y1+this.h;
                break;
            case Align.Center:
                y1=(parent.h-this.h)/2;
                y2=y1+this.h;
                break;
            case Align.Down:
                y1=parent.h-this.h-padding;
                y2=y1+this.h;
                break;
            case Align.ParentHeight:
                y1=padding;
                y2=parent.h-padding;
                this.h=y2-y1;
                break;
            }

            if(this.anchor) {
                let anchor=this.anchor;
                if(anchor.mode&EAnchor.X) {
                    x1=padding+(parent.w-padding-padding-this.w)*anchor.x;
                    x2=x1+this.w;
                }
                if(anchor.mode&EAnchor.Y) {
                    y1=padding+(parent.h-padding-padding-this.h)*anchor.y;
                    y2=y1+this.h;
                }
            }
            if(this.dock) {
                let dock=this.dock;
                let pw=parent.w-padding-padding;
                let ph=parent.h-padding-padding;
                if(dock.mode&EDock.Left) {
                    x1=padding+pw*dock.x;
                }
                if(dock.mode&EDock.Top) {
                    y1=padding+ph*dock.y;
                }
                if(dock.mode&EDock.Right) {
                    x2=padding+pw*dock.z-1;
                }
                if(dock.mode&EDock.Down) {
                    y2=padding+ph*dock.w-1;
                }
                this.w=x2-x1;
                this.h=y2-y1;
            }

            if(Use_ImTransform) {
                px=parent.w*parent.origin.x;
                py=parent.h*parent.origin.y;
            }else {        
                px=parent._screenXY.x+this.offset.x;    //+parent.borderWidth;
                py=parent._screenXY.y+this.offset.y;    //+parent.borderWidth;
            }
        }

        if(Use_ImTransform) {

            let ox=this.w*this.origin.x;
            let oy=this.h*this.origin.y;
            if(this.originOffset) {
                ox+=this.originOffset.x;
                oy+=this.originOffset.y;
            }
            let x=Math.round(-px+ox+x1+this.offset.x);
            let y=Math.round(-py+oy+y1+this.offset.y);
            this._local.translate.Set(x,y);
            x1=-ox;
            y1=-oy;
            x2=x1+this.w;
            y2=y1+this.h;
            this._local.rotate.SetRotate(this.rotate);
            this._local.scale=this.scale;
            this._world=(parent)?parent._world.Multiply(this._local):this._local;
            this._invWorld=this._world.Invert();
        }else {
            x1+=px;
            y1+=py;
            x2+=px;
            y2+=py;
        }
        x1=Math.round(x1);
        x2=Math.round(x2);
        y1=Math.round(y1);
        y2=Math.round(y2);
        this._screenXY.Set(x1, y1);
        this._screenMax.Set(x2, y2);
        if(Use_ImTransform) {
            let screenXY=this.screenXY;
            let screenMax=this.screenMax;
            this._clipXY.Set(screenXY.x+this.padding,screenXY.y+this.padding);
            this._clipMax.Set(screenMax.x-this.padding,screenMax.y-this.padding);
        }else {
            this._clipXY.Set(x1+this.padding,y1+this.padding);
            this._clipMax.Set(x2-this.padding,y2-this.padding);
        }
        this.isCalRect=false;

        if(this.on_size) {
            this.on_size();
        }
        
        if(this.arrange) {
            let x=this.padding;
            let y=this.padding;
            let w=this.w-this.padding;
            let h=this.h-this.padding;
            let next=0;
            switch(this.arrange.mode) {
            case EArrange.Item: {
                w=(this.w-this.padding-this.padding)/this.arrange.item_per_row;
                h=(this.h-this.padding-this.padding)/this.arrange.item_per_row;
                for(let i=0;i<this.pChild.length;i++)   {
                    let ch=this.pChild[i];
                    if(!ch.isVisible)
                        continue;
                    ch.x=x;
                    ch.y=y;
                    next++;
    
                    switch(this.arrange.direction) {
                    case EDirection.Vertical:
                        x+=w;
                        if(next>=this.arrange.item_per_row) {
                            next=0;
                            x=this.padding;
                            y+=this.arrange.item_size.y;
                        }
                        break;
                    case EDirection.Horizontal:
                        y+=h;
                        if(next>=this.arrange.item_per_row) {
                            next=0;
                            y=this.padding;
                            x+=this.arrange.item_size.x;
                        }
                        break;
                    }
                }
                break; }
            case EArrange.Content:
                for(let i=0;i<this.pChild.length;i++)   {
                    let ch=this.pChild[i];
                    if(!ch.isVisible)
                        continue;
                    switch(this.arrange.direction) {
                    case EDirection.Vertical:
                        if(ch.margin.x+ch.w>w) {
                            x=this.padding;
                            y+=next;
                            next=0;
                            w=this.w-this.padding;
                        }
                        ch.x=x+ch.margin.x;
                        ch.y=y+ch.margin.y;
                        x+=ch.w+ch.margin.x;
                        w=this.w-this.padding-x;
                        next=Math.max(next, ch.h+ch.margin.y);
                        break;
                    case EDirection.Horizontal:
                        if(ch.margin.y+ch.h>h) {
                            y=this.padding;
                            x+=next;
                            next=0;
                            h=this.h-this.padding;
                        }
                        ch.x=x+ch.margin.x;
                        ch.y=y+ch.margin.y;
                        y+=ch.h+ch.margin.y;
                        h=this.h-this.padding-y;
                        next=Math.max(next,ch.w+ch.margin.x);
                        break
                    } 
                }
                break;
            }
        }
        if(this.autosize&EAutosize.Height)   {
            let maxh=0;
            for(let i=0;i<this.pChild.length;i++)   {
                let ch=this.pChild[i];
                if(!ch.isVisible)
                    continue;
                maxh=Math.max(maxh, ch.y+ch.h);
            }
            maxh+=this.padding;
            if(this.h!=maxh) {
                this.h=maxh;
                this._autosize_change=true;
            }
        }
        if(this.autosize&EAutosize.Width)   {
            let maxw=0;
            for(let i=0;i<this.pChild.length;i++)   {
                let ch=this.pChild[i];
                if(!ch.isVisible)
                    continue;
                maxw=Math.max(maxw, ch.x+ch.w);
            }
            maxw+this.padding;
            if(this.w!=maxw) {
                this.w=maxw;
                this._autosize_change=true;
            }
        }        
    }

    GetNotify(pos:ImGui.ImVec2):zlUIWin
    {
        if(this.isDisable)
            return undefined;
        if(!this.isVisible)
            return undefined;

        if(Use_ImTransform) {
            if(!this._invWorld)
                return undefined;
            let pt=this._invWorld.Transform(pos);
            if(!Inside(pt, this._screenXY, this._screenMax)) {
                return undefined;
            }
        }
        else { 
            if(!Inside(pos, this._screenXY, this._screenMax))
                return undefined;
        }
        for(let i=this.pChild.length-1;i>=0;i--) {
            let n=this.pChild[i].GetNotify(pos);
            if(n) return n;
        }
        if(!this.isCanNotify)
            return undefined;
        return this;
    }
    GetUIWin(pos:ImGui.ImVec2, csid:string):zlUIWin
    {
        if(this.isDisable)
            return undefined;
        if(!this.isVisible)
            return undefined;
        if(Use_ImTransform) {
            if(!this._invWorld)
                return undefined;
            let pt=this._invWorld.Transform(pos);
            if(!Inside(pt, this._screenXY, this._screenMax))
                return undefined;
        }
        else {
            if(!Inside(pos, this._screenXY, this._screenMax))
                return undefined;
        }
        for(let i=this.pChild.length-1;i>=0;i--) {
            let n=this.pChild[i].GetUIWin(pos, csid);
            if(n) return n;
        }
        return (this._csid==csid)?this:undefined;        
    }

    OnNotify():void { if(this.on_notify) this.on_notify(this);}
    OnClick():void {}
    GetUI(name:string):zlUIWin
    {
        name=name.toLowerCase();
        if(this.isDisable)
            return undefined;
        if(this.Name && this.Name==name)
            return this;
        if(!this.pChild)
            return undefined;
        for(let i=0;i<this.pChild.length;i++)    {
            let found=this.pChild[i].GetUI(name);
            if(found)
                return found;
        }
        return undefined;
    }
    AddChild(obj:zlUIWin):void
    {
        if(!this.pChild)
            this.pChild=[];
        this.pChild.push(obj);
    }
    GetLastChild():zlUIWin
    {
        if(this.pChild.length>0)    {
            return this.pChild[this.pChild.length-1];
        }
        return undefined;
    }
    HasChild(obj:zlUIWin):boolean
    {
        for(let i=0;i<this.pChild.length;i++)   {
            let ch=this.pChild[i];
            if(ch===obj)
                return true;
            let found=ch.HasChild(obj);
            if(found)
                return true;
        }
        return false;
    }
    set Text(text:string) {}
    set Image(name:string) {}
    set Color(color:Vec4) {}
    get Color():Vec4 {return {x:1,y:1,z:1,w:1}}
    get screenXY():ImGui.ImVec2
    {
        return Use_ImTransform&&this._world?this._world.Transform(this._screenXY): this._screenXY;
    }
    get screenMax():ImGui.ImVec2
    {
        return Use_ImTransform&&this._world?this._world.Transform(this._screenMax): this._screenMax;
    }

    Name:string;
    isCalRect:boolean=false;
    isDisable:boolean=false; //disable: GetUI GetNotify
    isVisible:boolean=true;
    isDown:boolean=false;
    isCanNotify:boolean=true;
    isCanDrag:boolean=false;
    isClip:boolean=false;
    //isAutoHeight:boolean=false;
    isDelete:boolean=false;
    pChild:zlUIWin[]=[];
    x:number=0;
    y:number=0;
    w:number;
    h:number;
    align:Align=Align.None;
    add_x:number;
    add_y:number;
    borderWidth:number=0;
    padding:number=0;
    margin:Vec2={x:0,y:0};
    anchor:IAnchor;
    dock:IDock;
    arrange:IArrange;
    offset:Vec2={x:0,y:0}
    autosize:EAutosize=EAutosize.None;    
    hint:string;
    alpha:number=1;

    rotate:number=0;
    scale:number=1;
    origin:Vec2={x:0.5, y:0.5};
    originOffset:Vec2;

    _csid:string;
    _owner:zlUIMgr;
    _screenXY:ImGui.ImVec2=new ImGui.ImVec2(0,0);
    _screenMax:ImGui.ImVec2=new ImGui.ImVec2(0,0);
    _clipXY:ImGui.ImVec2=new ImGui.ImVec2(0,0);
    _clipMax:ImGui.ImVec2=new ImGui.ImVec2(0,0);
    _autosize_change:boolean=false;
    _isPaintout:boolean=false;

    _local:ImGui.ImTransform=new ImGui.ImTransform();
    _world:ImGui.ImTransform;
    _invWorld:ImGui.ImTransform;

    user_data:any;
}

export {zlUIImage as UIImage}

export class zlUIImage extends zlUIWin
{
    constructor(own:zlUIMgr)
    {
        super(own)
        this._csid="Image";
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "image":
            this.SetImage(toks[1]);
            break;
        case "color":
            this.color=ParseColor(toks[1]);
            break;
        case "rounding":
            this.rounding=Number.parseInt(toks[1]);
            break;
        case "roundingcorner":
            this.roundingCorner=ParseCorner(toks[1]);
            break;    
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUIImage;
        this.image=o.image;
        this.color=o.color;
        this.rounding=o.rounding;
        this.roundingCorner=o.roundingCorner;
    }
    Clone():zlUIWin
    {
        let obj=new zlUIImage(this._owner)
        obj.Copy(this);
        return obj;
    }
    SetImage(name: string): void {
        this.image=this._owner.GetTexture(name);
    }

    Paint(drawlist:ImGui.ImDrawList):void 
    {
        if(this.image)  {
            let vstart=Use_ImTransform?drawlist.GetVertexSize():0;
            let im=this.image;
            if(im.texture._texture) {
                if(!im.uv1) {
                    this.image= UpdateTexturePack(im);
                }
                drawlist.AddImageRounded(
                    im.texture._texture, 
                    this._screenXY, this._screenMax, im.uv1, im.uv2, this.color,
                    this.rounding, this.roundingCorner);
            }
            if(Use_ImTransform) {
                drawlist.Transform(this._world, vstart);
            }
        }
        super.Paint(drawlist);
    }

    set Image(name:string) {this.SetImage(name);}
    set Color(c:Vec4) {this.color=toColorHex(c);}
    get Color():Vec4 {return fromColorHex(this.color);}

    image:TexturePack;
    color:number=0xffffffff;
    rounding:number=0;
    roundingCorner:ImGui.ImDrawCornerFlags=ImGui.ImDrawCornerFlags.All;
}

export {zlUIPanel as UIPanel}

export class zlUIPanel extends zlUIImage
{
    constructor(own:zlUIMgr)
    {
        super(own)
        this._csid="Panel";
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "drawclient":
            this.isDrawClient=ParseBool(toks[1]);
            break;
        case "drawborder":
            this.isDrawBorder=ParseBool(toks[1]);
            break;
        case "borderwidth":
            this.borderWidth=Number.parseInt(toks[1]);
            break;
        case "bordercolor":
            this.borderColor=ParseColor(toks[1]);
            break;
        case "colorhover":
            this.isDrawHover=true;
            this.colorHover=ParseColor(toks[1]);
            break;
        case "text":
            this.text=ParseText(toks.pop());
            break;
        case "textalignw":
            this.textAlignW=ParseAlign(toks[1]);
            break;
        case "textalignh":
            this.textAlignH=ParseAlign(toks[1]);
            break;
        case "textcolor":
            this.textColor=ParseColor(toks[1]);
            break;
        case "textcolorhover":
            this.textColorHover=ParseColor(toks[1]);
            break;
        case "font":
            this.fontIndex=Number.parseInt(toks[1]);
            break;
        case "board":
            this.board=ParseBoard(toks, this._owner);
            break;
        case "multiline":
            this.isMultiline=ParseBool(toks[1]);
            break;
        case "textanchor":
            this.textAnchor={
                mode:ParseAnchor(toks[1]),
                x:Number.parseFloat(toks[2]),
                y:Number.parseFloat(toks[3])
            }
            break;
        case "textoffset":
            this.textoffset={
                x:Number.parseInt(toks[1]),
                y:Number.parseInt(toks[2])
            };
            break;
        case "color4":
            this.color4=[
                ParseColor(toks[1]),
                ParseColor(toks[2]),
                ParseColor(toks[3]),
                ParseColor(toks[4]),
            ];
            break;
        case "colorhover4":
            this.isDrawHover=true;
            this.colorHover4=[
                ParseColor(toks[1]),
                ParseColor(toks[2]),
                ParseColor(toks[3]),
                ParseColor(toks[4])]
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    CloneBoard(obj:Board):Board
    {
        if(!obj)
            return null;
        let b:Board={
            x1:obj.x1,
            y1:obj.y1,
            x2:obj.x2,
            y2:obj.y2,
            image:obj.image
        }
        return b;
    }

    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUIPanel;
        this.text=o.text;
        this.textColor=o.textColor;
        this.textColorHover=o.textColorHover;
        this.textAlignW=o.textAlignW;
        this.textAlignH=o.textAlignH;
        this.isMultiline=o.isMultiline;
        this.isPassword=o.isPassword;
        this.passwordText=o.passwordText;
        this.fontIndex=o.fontIndex;
        this.isDrawClient=o.isDrawClient;
        this.isDrawBorder=o.isDrawBorder;
        this.isDrawHover=o.isDrawHover;
        this.borderColor=o.borderColor;
        this.colorHover=o.colorHover;
        this.board=this.CloneBoard(o.board);
        this.drawBoard=o.drawBoard;
        this.textAnchor=Clone(o.textAnchor);
        this.textoffset=Clone(o.textoffset);
        this.color4=Clone(o.color4);
        this.colorHover4=Clone(o.colorHover4);
    }
    Clone():zlUIWin
    {
        let obj=new zlUIPanel(this._owner)
        obj.Copy(this);
        return obj;
    }

    PaintBoard(drawlist:ImGui.ImDrawList, board:Board):void 
    {
        if(!board.image.texture._texture)
            return;
        if(!board.image.uv1)    {
            board.image=UpdateTexturePack(board.image);
        }
        if(!board.vert)   {
            const iw=board.image.x2-board.image.x1;
            const ih=board.image.y2-board.image.y1;
            const x1=this._screenXY.x;
            const x2=x1+board.x1;
            const x3=this._screenMax.x-(iw-board.x2);
            const x4=this._screenMax.x;
            const y1=this._screenXY.y;
            const y2=y1+board.y1;
            const y3=this._screenMax.y-(ih-board.y2);
            const y4=this._screenMax.y;

            board.vert=[];
            board.vert.push(new ImGui.Vec2(x1, y1));    
            board.vert.push(new ImGui.Vec2(x2, y1));
            board.vert.push(new ImGui.Vec2(x3, y1));
            board.vert.push(new ImGui.Vec2(x4, y1));
            board.vert.push(new ImGui.Vec2(x1, y2));
            board.vert.push(new ImGui.Vec2(x2, y2));
            board.vert.push(new ImGui.Vec2(x3, y2));
            board.vert.push(new ImGui.Vec2(x4, y2));
            board.vert.push(new ImGui.Vec2(x1, y3));
            board.vert.push(new ImGui.Vec2(x2, y3));
            board.vert.push(new ImGui.Vec2(x3, y3));
            board.vert.push(new ImGui.Vec2(x4, y3));
            board.vert.push(new ImGui.Vec2(x1, y4));
            board.vert.push(new ImGui.Vec2(x2, y4));
            board.vert.push(new ImGui.Vec2(x3, y4));
            board.vert.push(new ImGui.Vec2(x4, y4));

            board.visible=[];
            board.visible.push((x2-x1)>0 && (y2-y1)>0);
            board.visible.push((x3-x2)>0 && (y2-y1)>0);
            board.visible.push((x4-x3)>0 && (y2-y1)>0);
            board.visible.push((x2-x1)>0 && (y3-y2)>0);
            board.visible.push((x3-x2)>0 && (y3-y2)>0);
            board.visible.push((x4-x3)>0 && (y3-y2)>0);
            board.visible.push((x2-x1)>0 && (y4-y3)>0);
            board.visible.push((x3-x2)>0 && (y4-y3)>0);
            board.visible.push((x4-x3)>0 && (y4-y3)>0);

            const sw=1.0/board.image.texture._width;
            const sh=1.0/board.image.texture._height;
            const u1=board.image.uv1.x;
            const u2=board.image.uv1.x+board.x1*sw;
            const u3=board.image.uv1.x+board.x2*sw;
            const u4=board.image.uv2.x;
            const v1=board.image.uv1.y;
            const v2=board.image.uv1.y+board.y1*sh;
            const v3=board.image.uv1.y+board.y2*sh;
            const v4=board.image.uv2.y;
            board.uv=[];
            board.uv.push(new ImGui.Vec2(u1, v1));
            board.uv.push(new ImGui.Vec2(u2, v1));
            board.uv.push(new ImGui.Vec2(u3, v1));
            board.uv.push(new ImGui.Vec2(u4, v1));
            board.uv.push(new ImGui.Vec2(u1, v2));
            board.uv.push(new ImGui.Vec2(u2, v2));
            board.uv.push(new ImGui.Vec2(u3, v2));
            board.uv.push(new ImGui.Vec2(u4, v2));
            board.uv.push(new ImGui.Vec2(u1, v3));
            board.uv.push(new ImGui.Vec2(u2, v3));
            board.uv.push(new ImGui.Vec2(u3, v3));
            board.uv.push(new ImGui.Vec2(u4, v3));
            board.uv.push(new ImGui.Vec2(u1, v4));
            board.uv.push(new ImGui.Vec2(u2, v4));
            board.uv.push(new ImGui.Vec2(u3, v4));
            board.uv.push(new ImGui.Vec2(u4, v4));
        }

        for(let i=0;i<3;i++)    {
            if(board.visible[i])    {
                drawlist.AddImage(board.image.texture._texture,board.vert[i], board.vert[i+5], board.uv[i], board.uv[i+5], board.color);
            }
            if(board.visible[i+3])    {
                drawlist.AddImage(board.image.texture._texture,board.vert[i+4], board.vert[i+9], board.uv[i+4], board.uv[i+9], board.color);
            }
            if(board.visible[i+6])    {
                drawlist.AddImage(board.image.texture._texture,board.vert[i+8], board.vert[i+13], board.uv[i+8], board.uv[i+13], board.color);                
            }
        }
    }
    PaintClient(drawlist:ImGui.ImDrawList):void 
    {
        if(this.isDrawClient)   {
            if(this.color4) {
                drawlist.AddRectFilledMultiColorRound(
                    this._screenXY, this._screenMax, 
                    this.color4[0], this.color4[1], this.color4[2], this.color4[3],
                    this.rounding, this.roundingCorner);
            }else {
                drawlist.AddRectFilled(this._screenXY, this._screenMax, this.color,
                    this.rounding, this.roundingCorner);
            }
        }
    }
    PaintPanel(drawlist:ImGui.ImDrawList):void 
    {
        if(this.image)  {
            let im=this.image;
            if(im.texture._texture) {
                if(!im.uv1) {
                    this.image= UpdateTexturePack(im);
                }
                drawlist.AddImage(im.texture._texture, this._screenXY, this._screenMax, im.uv1, im.uv2, this.color);
            }
        }
        this.PaintClient(drawlist);
        if(this.drawBoard)  {
            this.drawBoard.color=this.color;
            this.PaintBoard(drawlist, this.drawBoard);
        }
        if(this.isDrawHover && this._owner.hover==this) {
            if(this.colorHover4) {
                drawlist.AddRectFilledMultiColorRound(
                    this._screenXY, this._screenMax, 
                    this.colorHover4[0], this.colorHover4[1], this.colorHover4[2], this.colorHover4[3],
                    this.rounding, this.roundingCorner)                
            }else {
                drawlist.AddRectFilled(this._screenXY, this._screenMax, this.colorHover,
                    this.rounding, this.roundingCorner);
            }
        }
        if(this.isDrawBorder)   {
            drawlist.AddRect(this._screenXY, this._screenMax, this.borderColor, this.rounding, 
                this.roundingCorner, this.borderWidth);
        }
        if(this.text)   {
            let text=this.text;
            let font=this._owner.GetFont(this.fontIndex);
            if(this.isPassword) {
                if(!this.passwordText || this.text.length!=this.passwordText.length)  {
                    this.passwordText=this.text;
                    this.passwordText=this.passwordText.replace(/./g, '*')
                }
                text=this.passwordText;
            }else {
            }
            let wrap=this.isMultiline?this.w:0;
            let color=this.textColor;
            if(this.textColorHover && this._owner.hover==this) {
                color=this.textColorHover;
            }
            if(!color)  {
                console.log(this);
            }
            if(Use_ImTransform) {
                font.RenderText(drawlist, font.FontSize, this._textPos, color,
                    this._textClip, text, text.length, wrap, false);    
            }else {
                drawlist.AddText(font, font.FontSize, this._textPos, color, text, text.length, wrap);
            }
        }
    }

    Paint(drawlist:ImGui.ImDrawList):void 
    {
        if(Use_ImTransform) {
            if(this._world) {
                let vstart=drawlist.GetVertexSize();    
                this.PaintPanel(drawlist);
                drawlist.Transform(this._world, vstart);
            }
        }else {
            this.PaintPanel(drawlist);
        }
        super.Paint(drawlist);
    }

    SetText(text:string):void
    {
        this.text=text;
        if(this._textSize)
            this._textSize.x=0;        
        this.isCalRect=true;
        if(this.on_change)  {
            this.on_change(text);
        }
    }

    CalRect(parent:zlUIWin):void 
    {
        super.CalRect(parent);
        //let screenXY=this.screenXY;
        //let screenMax=this.screenMax;
        //this._clipXY.Set(screenXY.x+this.borderWidth,screenXY.y+this.borderWidth);
        //this._clipMax.Set(screenMax.x-this.borderWidth, screenMax.y-this.borderWidth);
        if(this.board)  {
            this.board.vert=null;
            this.board.color=this.color;
            this.drawBoard=this.board;
        }
        if(this.text)   {
            let font=this._owner.GetFont(this.fontIndex);
            let wrap=this.isMultiline?this.w:0;
            let text=this.text;
            if(this.isPassword && this.passwordText) {
                text=this.passwordText;
            }
            let isReady: ImGui.ImScalar<boolean> = [false];
            let size=font.CalcTextSizeA(font.FontSize, ImGui.FLT_MAX, wrap, text, null, null, isReady);
            if(!isReady[0]) {
                this.isCalRect=true;
            }
            let x,y;
            this._textSize=size;            
            switch(this.align) {
            case Align.TextWidth:
                this.w=size.x+this.padding+this.padding;
                this.SetCalRect();
                break;
            case Align.TextHeight:
                this.h=size.y+this.padding+this.padding;
                this.SetCalRect();
                break;
            case Align.TextSize:
                this.w=size.x+this.padding+this.padding;
                this.h=size.y+this.padding+this.padding;
                this.SetCalRect();
                break;
            }
            switch(this.textAlignW)  {
            case Align.Left:
                x=this.padding;
                break;
            case Align.Center:
                x=(this.w-size.x)*0.5;
                break;
            case Align.Right:
                x=this.w-size.x-this.padding;
                break
            }
            switch(this.textAlignH)  {
            case Align.Top:
                y=this.padding;
                break;
            case Align.Center:
                y=(this.h-size.y)*0.5;
                break;
            case Align.Down:
                y=this.h-size.y-this.padding;
                break;
            }
            if(this.textAnchor) {
                let anchor=this.textAnchor;
                if(anchor.mode&EAnchor.X) {
                    x=this.padding+(this.w-size.x-this.padding-this.padding)*anchor.x;
                }
                if(anchor.mode&EAnchor.Y) {
                    y=this.padding+(this.h-size.y-this.padding-this.padding)*anchor.y;
                }
            }
            if(this.textoffset) {
                x+=this.textoffset.x;
                y+=this.textoffset.y;
            }
    
            x+=this._screenXY.x;
            y+=this._screenXY.y;
            x=Math.round(x);
            y=Math.round(y);
            if(!this._textPos) {
                this._textPos=new ImGui.Vec2(x,y);
            }else {
                this._textPos.x=x;
                this._textPos.y=y;
            }
            if(!this._textClip) {
                this._textClip=new ImGui.Vec4(0,0);
            }
            this._textClip.x=this._screenXY.x;
            this._textClip.y=this._screenXY.y;
            this._textClip.z=this._screenMax.x;
            this._textClip.w=this._screenMax.y;

            if((this.autosize&EAutosize.Height) &&size.y>0) {
                if(size.y>this.h)    {
                    this.h=size.y;
                    this._autosize_change=true;
                }
            }
            if((this.autosize&EAutosize.Width) &&size.x>0) {
                if(size.x>this.w)    {
                    this.w=size.x;
                    this._autosize_change=true;
                }
            }
        }
    }

    set Text(text:string) {this.SetText(text);}

    text:string="";
    textColor:number=0xff000000;
    textColorHover:number;
    textAlignW:Align=Align.Center;
    textAlignH:Align=Align.Center;
    isMultiline:boolean=false;
    isPassword:boolean=false;
    passwordText:string;
    fontIndex:number=0;
    isDrawClient:boolean=true;
    isDrawBorder:boolean=false;
    isDrawHover:boolean=false;
    borderColor:number=0xffffffff;
    colorHover:number=0xffffffff;
    board:Board;
    drawBoard:Board;
    textAnchor:IAnchor;
    textoffset:Vec2;

    color4:number[];
    colorHover4:number[];

    //underline variant no copy needed
    _textPos:ImGui.Vec2;
    _textSize:ImGui.Vec2;
    _textClip:ImGui.Vec4;
}

export {zlUIEdit as UIEdit}

export class zlUIEdit extends zlUIPanel
{
    on_edit: ((this: zlUIWin, obj: zlUIEdit) => any) | null; 

    constructor(own:zlUIMgr)
    {
        super(own)
        this._csid="Edit";
    }

    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "password":
            this.isPassword=true;
            this.password_char=ParseText(toks[1]);
            break;
        case "maxlength":
            this.max_text_length=Number.parseInt(toks[1]);
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUIEdit;
        this.password_char=o.password_char;
        this.isEnable=o.isEnable;
        this.max_text_length=o.max_text_length;
    }
    Clone():zlUIWin
    {
        let obj=new zlUIEdit(this._owner)
        obj.Copy(this);
        return obj;
    }

    to_rgba(c:number):string
    {
        const r=c&0xff;
        const g=(c>>8)&0xff;
        const b=(c>>16)&0xff;
        const a=(c>>24)&0xff;        
        return "rgba("+r+","+g+","+b+","+a+")";
    }
    to_rgb(c:number):string
    {
        const r=c&0xff;
        const g=(c>>8)&0xff;
        const b=(c>>16)&0xff;
        return "rgba("+r+","+g+","+b+",255)";
    }

    OnNotify(): void {
        if(!this.isEnable)
            return;
        let inp:Input;
        const textCol=this.to_rgb(this.textColor);
        const textBg=this.to_rgb(this.color);
        if(this.isPassword)   {
            inp=GetInput(EType.ePassword, textCol, textBg);
        }else if(this.isMultiline) {
            inp=GetInput(EType.eMultiLine, textCol, textBg);
        }else {
            inp=GetInput(EType.eInput, textCol, textBg);
        }
        switch(this.textAlignW) {
        case Align.Left:
            inp._dom_input.style.textAlign="left";
            break;
        case Align.Center:
            inp._dom_input.style.textAlign="center";
            break;
        case Align.Right:
            inp._dom_input.style.textAlign="right";
            break;
        }
        let screenXY=this.screenXY;
        inp.setText(this.text, 0, this._owner.GetFont(this.fontIndex));
        inp.setRect(screenXY.x, screenXY.y, this.w, this.h);
        inp._dom_input.style.backgroundColor=textBg;
        inp._dom_input.style.color=textCol;
        inp._dom_input.oninput=(e)=>{
            let text=inp._dom_input.value;
            if(this.max_text_length&&this.max_text_length>0)    {
                text=text.slice(0,this.max_text_length);
            }
            this.SetText(text);
            if(this.on_edit) {
                this.on_edit(this);
            }
            if(this._owner.on_edit) {
                this._owner.on_edit(this);
            }
        }
        inp.on_input=(e)=>{
            if(inp.isTab) {
                this._owner.nextEdit=this;
            }
        }
        this._owner.dom_input=inp;
        console.log("OnNotify", this);
    }

    password_char:string;
    isEnable:boolean=true;
    max_text_length:number;
}

export {zlUIButton as UIButton}

export class zlUIButton extends zlUIPanel
{
    on_click:(this:zlUIWin, obj:zlUIButton)=>any|null;
    
    constructor(own:zlUIMgr)
    {
        super(own)
        this._csid="Button";
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "boarddown":
            this.boardDown=ParseBoard(toks, this._owner);
            break;
        case "board":
            this.board=this.boardUp=this.boardHover=ParseBoard(toks, this._owner);
            break;
        case "boardup":
            this.boardUp=ParseBoard(toks, this._owner);
            break;
        case "boardhover":
            this.boardHover=ParseBoard(toks, this._owner);
            break;
        case "color":
            this.colorUp=this.color=this.colorHover=ParseColor(toks[1]);
            break;
        case "color4":
            this.colorUp4=[
                ParseColor(toks[1]), 
                ParseColor(toks[2]),
                ParseColor(toks[3]),
                ParseColor(toks[4])
            ]
            break;
        case "colordown":
            this.colorDown=ParseColor(toks[1]);
            break;
        case "colordown4":
            this.colorDown4=[
                ParseColor(toks[1]), 
                ParseColor(toks[2]),
                ParseColor(toks[3]),
                ParseColor(toks[4])];
            break;
        case "colordisable":
            this.colorDisable=ParseColor(toks[1]);
            break;
        case "textcolor":
            this.textColor=ParseColor(toks[1]);
            this.textColorDown=this.textColor;
            this.textColorUp=this.textColor;
            break;
        case "textcolordown":
            this.textColorDown=ParseColor(toks[1]);
            break;
        case "textcolorup":
            this.textColorUp=ParseColor(toks[1]);    
            break;
        case "image":
            this.isDrawClient=false;
            this.imageUp=this.image=this.imageHover=this._owner.GetTexture(toks[1]);
            break;
        case "imagedown":
            this.isDrawClient=false;
            this.imageDown=this._owner.GetTexture(toks[1]);
            break;
        case "imagehover":
            this.isDrawClient=false;
            this.imageHover=this._owner.GetTexture(toks[1]);
            break;
        case "drawbutton":
            this.isPaintButton=ParseBool(toks[1]);
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUIButton;
        this.boardDown=this.CloneBoard(o.boardDown);
        this.boardUp=this.CloneBoard(o.boardUp);
        this.boardHover=this.CloneBoard(o.boardHover);
        this.colorDown=o.colorDown;
        this.colorUp=o.colorUp;
        this.colorDisable=o.colorDisable;
        this.textColorDown=o.textColorDown;
        this.textColorUp=o.textColorUp;
        this.imageDown=o.imageDown;
        this.imageUp=o.imageUp;
        this.imageHover=o.imageHover;
        this.isEnable=o.isEnable;
        this.isPaintButton=o.isPaintButton;
        this.colorDown4=Clone(o.colorDown4);
        this.colorUp4=Clone(o.colorUp4);
    }
    Clone():zlUIWin
    {
        let obj=new zlUIButton(this._owner)
        obj.Copy(this);
        return obj;
    }
    PaintClient(drawlist: ImGui.ImDrawList): void {
        if(this.isDrawClient)   {
            let color:number;
            let color4:number[];

            if(!this.isEnable)  {
                color=this.colorDisable;
            }else if(this.isDown) {
                color=this.colorDown;
                color4=this.colorDown4;
            }else if(this._owner.hover==this) {
                color=this.colorHover;
                color4=this.colorHover4;
            }else {
                color=this.colorUp;
                color4=this.colorUp4;
            }

            if(color4) {
                drawlist.AddRectFilledMultiColorRound(
                    this._screenXY, this._screenMax, 
                    color4[0], color4[1], color4[2], color4[3],
                    this.rounding, this.roundingCorner);
            }else {
                drawlist.AddRectFilled(this._screenXY, this._screenMax, color,
                    this.rounding, this.roundingCorner);
            }
        }
    }
    PaintButton():void
    {
        if(!this.isEnable)  {
            this.color=this.colorDisable;
        }
        else if(this.isDown) {
            if(this.boardDown)  {
                this.drawBoard=this.boardDown;
            }
            if(this.imageDown)  {
                this.image=this.imageDown;
            }
            this.color=this.colorDown;
        }else if(this._owner.hover==this) {
            this.isDrawHover=false;
            this.drawBoard=this.boardHover;
            this.image=this.imageHover;
        }else {
            this.drawBoard=this.boardUp;
            this.image=this.imageUp;
        }
    }
    PaintTextColor():void
    {
        if(!this.isEnable) {
            
        }
        else if(this.isDown) {
            this.textColor=this.textColorDown;
        }else if(this._owner.hover==this) {

        }else {
            this.textColor=this.textColorUp;
        }
    }

    Paint(drawlist:ImGui.ImDrawList):void 
    {
        if(this.isPaintButton)  {
            this.PaintButton();
        }
        this.PaintTextColor();
        super.Paint(drawlist);
    }
    GetNotify(pos:ImGui.ImVec2):zlUIWin
    {
        if(!this.isEnable)
            return null;
        return super.GetNotify(pos);
    }
    CalRect(parent:zlUIWin):void 
    {
        super.CalRect(parent);
        if(this.boardDown)  {
            this.boardDown.vert=null;
            this.boardDown.color=this.colorDown;
        }
        if(this.boardUp)  {
            this.boardUp.vert=null;
            this.boardUp.color=this.colorUp;
        }
    }
    OnClick(): void {
        super.OnClick();
        if(this.on_click) {
            this.on_click(this);
        }
    }

    isPaintButton:boolean=true;

    boardDown:Board;
    boardUp:Board;
    boardHover:Board;
    colorDown:number=0xffffffff;
    colorUp:number=0xffffffff;
    colorDisable:number=0xff787878;
    textColorDown:number=0xffffffff;
    textColorUp:number=0xff808080;
    imageDown:TexturePack;
    imageUp:TexturePack;
    imageHover:TexturePack;
    isEnable:boolean=true;

    colorDown4:number[];
    colorUp4:number[];
}

export {zlUICheck as UICheck}

export class zlUICheck extends zlUIButton
{
    on_check: ((this: zlUIWin, check: boolean) => any) | null; 

    constructor(own:zlUIMgr)
    {
        super(own)
        this.isPaintButton=false;
        this._csid="Check";
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch (name) {
        case "drawcheck":
            this.isDrawCheck=ParseBool(toks[1]);            
            break;
        case "checktext":
            this.check_text=[toks[1],toks[2]];
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUICheck;
        this.isChecked=o.isChecked;
        this.isDrawCheck=o.isDrawCheck;
        this.check_text=o.check_text;
    }
    Clone():zlUIWin
    {
        let obj=new zlUICheck(this._owner)
        obj.Copy(this);
        return obj;
    }
    PaintButton(): void {
        if(!this.isEnable)  {
            this.color=this.colorDisable;
        }
        else if(this.isChecked) {
            if(this.boardDown)  {
                this.drawBoard=this.boardDown;
            }
            if(this.imageDown)  {
                this.image=this.imageDown;
            }
            this.color=this.colorDown;
        }else if(this._owner.hover==this) {
            this.drawBoard=this.boardHover;
            this.image=this.imageHover;
            this.color=this.colorHover;
        }else {
            this.drawBoard=this.boardUp;
            this.image=this.imageUp;
            this.color=this.colorUp;
        }        
    }
    PaintTextColor(): void {
        if(!this.isEnable) {
            
        }
        else if(this.isChecked) {
            this.textColor=this.textColorDown;
        }else if(this._owner.hover==this) {

        }else {
            this.textColor=this.textColorUp;
        }
    }
    Paint(drawlist:ImGui.ImDrawList):void 
    {
        if(!this.isEnable) {
            this.color=this.colorDisable;
        }        
        super.Paint(drawlist);
        if(this.isDrawCheck)    {
            let vstart=(Use_ImTransform)?drawlist.GetVertexSize():0;
            drawlist.AddRect(this.checkmark_xy, this.checkmark_max,
                this.borderColor, this.rounding, 
                ImGui.ImDrawCornerFlags.All, 1);
            if(this.isChecked) {
                let x=this.checkmark_xy.x+2;
                let y=this.checkmark_xy.y+2;
                RenderCheckMark(drawlist, x,y,this.textColor, 16);
            }
            if(Use_ImTransform) {
                drawlist.Transform(this._world, vstart);
            }
        }
    }
    OnClick():void {
        super.OnClick();
        this.isChecked=!this.isChecked;
        if(this.check_text) {
            this.SetText(this.isChecked?this.check_text[0]:this.check_text[1]);
        }
        if(this.on_check) {
            this.on_check(this.isChecked);
        }
    }
    CalRect(parent: zlUIWin): void {
        super.CalRect(parent);

        let x=this._screenXY.x+12;
        let y=(this._screenMax.y+this._screenXY.y)*0.5;
        this.checkmark_xy.Set(x-10,y-10);
        this.checkmark_max.Set(x+10,y+10);        
    }

    isChecked:boolean=false;
    isDrawCheck:boolean=true;
    checkmark_xy:ImVec2=new ImVec2;
    checkmark_max:ImVec2=new ImVec2;
    check_text:string[];
}

export {zlUICombo as UICombo}

export class zlUICombo extends zlUIButton
{
    on_combo:(this:zlUIWin, obj:zlUICombo)=>any|null;

    constructor(own:zlUIMgr)
    {
        super(own);
        this._csid="Combo"
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "comboitems":
            this.combo_items=toks.pop().split(/\s/g).filter(e=>e);
            break;
        case "combovalue":
            this.combo_value=Number.parseInt(toks[1]);
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    ParseEnd(): void {
        if(this.combo_items && this.combo_value!==undefined)  {
            this.Combo(this.combo_value);
        }
    }
    Copy(obj: zlUIWin): void 
    {
        super.Copy(obj);
        let o=obj as zlUICombo;
        this.isDrawCombo=o.isDrawCombo;
        this.combo_items=o.combo_items;
        this.combo_value=o.combo_value;
    }
    Clone(): zlUIWin {
        let obj=new zlUICombo(this._owner);
        obj.Copy(this);
        return obj;
    }
    Paint(drawlist: ImGui.ImDrawList): void 
    {
        super.Paint(drawlist);
        if(this.isDrawCombo) {
            let vstart=(Use_ImTransform)?drawlist.GetVertexSize():0;
            RenderArrow(drawlist, this.arrow_xy, this.textColor, ImGui.ImGuiDir.Down, 16, 1);
            if(Use_ImTransform) {
                drawlist.Transform(this._world, vstart);
            }
        }
    }
    CalRect(parent: zlUIWin): void 
    {
        super.CalRect(parent);

        this.arrow_xy.x=this._screenMax.x-18;
        this.arrow_xy.y=(this._screenMax.y+this._screenXY.y)*0.5-8;
    }
    Combo(value:number, items?:string[], on_combo?:(value:number)=>any)
    {
        if(items) {
            this.combo_items=items;
        }
        this.combo_value=value;
        this.SetText(this.combo_items[value]);
        this.on_click=(o)=>{
            let combo_menu=this._owner.DefaultComboMenu;
            let combo_item=this._owner.DefaultComboItem;
            combo_menu.pChild=[];
            let i=0;
            for(let item of this.combo_items) {
                let btn=combo_item.Clone() as zlUIButton;
                btn.isVisible=true;
                btn.SetText(item);
                btn.user_data=i;
                btn.on_click=(o)=>{
                    combo_menu.isDelete=true;
                    this._owner.ClosePopup();
                    this.combo_value=btn.user_data;
                    this.SetText(this.combo_items[this.combo_value]);
                    if(on_combo) {
                        on_combo(this.combo_value);
                    }
                    if(this.on_combo) {
                        this.on_combo(this);
                    }
                }
                combo_menu.ArrangeChild(btn,ESliderType.eVertical);
                i++;
            }
            if(i==0)
                return;
            if(Use_ImTransform) {
                let pt=new ImGui.ImVec2(this._screenXY.x,this._screenMax.y);
                pt=this._world.Transform(pt)
                combo_menu.x=pt.x;
                combo_menu.y=pt.y;
            }else {
                combo_menu.x=this._screenXY.x;
                combo_menu.y=this._screenMax.y;
            }
            combo_menu.w=this.w;
            combo_menu.h=i*combo_item.h;
            if(combo_menu.y+combo_menu.h>this._owner.h) {
                combo_menu.h=this._owner.h-combo_menu.y;
            }
            combo_menu.SetCalRect();
            this._owner.AddChild(combo_menu);
            this._owner.Popup(combo_menu);
        }
    }

    isDrawCombo:boolean=true;
    combo_items:string[];
    combo_value:number;

    arrow_xy:Vec2={x:0,y:0}
}

export enum ESliderType
{
    eVertical,
    eHorizontal,
    eBoth,
}

interface ScrollType
{
    isScrollW:boolean;
    isScrollH:boolean;    
}

export {zlUISlider as UISlider}

export class zlUISlider extends zlUIPanel
{
    on_scroll:((this:zlUIWin, value:number)=>any)|null

    constructor(own:zlUIMgr)
    {
        super(own)
        this._csid="Slider";
        this.isClip=true;
    }
    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "direction":
            this.scrollType = ParseSliderType(toks[1]);
            break;
        case "itemmode":
            this.is_item_mode=ParseBool(toks[1]);
            break;
        case "mousewheelspeed":
            this.mouse_wheel_speed=Number.parseFloat(toks[1]);
            break;
        default:
            return await super.ParseCmd(name, toks);
        }
        return true;
    }
    Copy(obj:zlUIWin):void
    {
        super.Copy(obj);
        let o=obj as zlUISlider;
        this.scrollType=o.scrollType;
        this.scrollbarColor=o.scrollbarColor;
        this.scroll_value=o.scroll_value;
        this.scroll_max=o.scroll_max;
        this.is_item_mode=o.is_item_mode;
        this.mouse_wheel_speed=o.mouse_wheel_speed
    }
    Clone():zlUIWin
    {
        let obj=new zlUISlider(this._owner)
        obj.Copy(this);
        return obj;
    }
    OnScrollValueChange(val:number):void
    {
        let old_value=this.scroll_value;
        this._is_scrollvalue_change=false;
        this.scroll_value=val;
        if(this.on_scroll) {
            this.on_scroll(val);
        }
        if(!this.is_item_mode) {
            let type=this.GetScrollType();
            let scroll_max=0;
            if(type.isScrollH)  {
                let y=-this.scroll_value;
                if(this.pChild) {
                    this.pChild.forEach(ch=>{
                        ch.y=y;
                        ch.SetCalRect();
                        y+=ch.h;
                        scroll_max+=ch.h;
                    })
                }
                let h=this.h-this.borderWidth-this.borderWidth;
                scroll_max=(scroll_max>h)?scroll_max-h:0;
            }
            if(type.isScrollW)  {
                let x=-this.scroll_value;
                if(this.pChild) {
                    this.pChild.forEach(ch=>{
                        ch.x=x;
                        ch.SetCalRect();
                        x+=ch.w;
                        scroll_max+=ch.w;
                    })
                }
                let w=this.w-this.borderWidth-this.borderWidth;
                scroll_max=(scroll_max>w)?scroll_max-w:0;
            }
            this.scroll_max=scroll_max;
        
        }
        if(this.scroll_value>this.scroll_max)    {
            this.scroll_value=this.scroll_max;
            this._is_scrollvalue_change=true;
        }
        this.CalScrollRect();
        
        if(this._owner.dom_input && this.HasChild(this._owner.notify) && old_value!=val)   {
            this._owner.dom_input.setVisible(false);
            this._owner.dom_input=null;
        }
        
    }

    Refresh(ti:number, parent:zlUIWin=null):void 
    {
        for(let i=0;i<this.pChild.length;i++)   {
            let ch=this.pChild[i];
            if(ch._autosize_change) {
                this._is_scrollvalue_change=true;
                ch._autosize_change=false;
            }
        }

        let own=this._owner;
        if(own.hover_slider==this && own.any_pointer_down&&own.slider==null)   {
            own.slider=this;
            this._first_pos=new ImGui.Vec2(own.mouse_pos.x, own.mouse_pos.y);
            this._first_value=this.scroll_value;
            this._first_scrollbar=Inside(this._first_pos, this._scrollHxy, this._scrollHxy2);
        }
        if(own.hover_slider==this&&own.mouse_wheel!=0) {
            let val=this.scroll_value-own.mouse_wheel*this.mouse_wheel_speed;
            if(val<0) val=0;
            else if(val>this.scroll_max) val=this.scroll_max;
            this.OnScrollValueChange(val);
        }
        if(own.slider==this)    {
            let type=this.GetScrollType();
            if(type.isScrollH)  {
                let val=this._first_value;
                let offset=this._first_pos.y-own.mouse_pos.y;
                if(this._first_scrollbar)    {
                    let h=this.h-this.borderWidth-this.borderWidth;
                    let scaleh=h/(h+this.scroll_max);
                    val=this._first_value-offset/scaleh;
                }else {
                    val=this._first_value+offset;
                }
                val=Math.ceil(val);
                if(val<0) val=0;
                else if(val>this.scroll_max) val=this.scroll_max;
                if(val!=this.scroll_value)  {
                    this.OnScrollValueChange(val);
                }
            }
            if(type.isScrollW) {
                let val=this._first_value;
                let offset=this._first_pos.x-own.mouse_pos.x;
                if(this._first_scrollbar)    {
                    let w=this.w-this.borderWidth-this.borderWidth;
                    let scalew=w/(w+this.scroll_max);
                    val=this._first_value-offset/scalew;
                }else {
                    val=this._first_value+offset;
                }
                val=Math.ceil(val);
                if(val<0) val=0;
                else if(val>this.scroll_max) val=this.scroll_max;
                if(val!=this.scroll_value)  {
                    this.OnScrollValueChange(val);
                }
            }
        }
        if(this._is_scrollvalue_change)  {
            this.OnScrollValueChange(this.scroll_value);
        }
        if(!own.any_pointer_down)   {
            own.slider=null;
        }
        super.Refresh(ti, parent);
    }
    Paint(drawlist:ImGui.ImDrawList):void 
    {
        super.Paint(drawlist);

        let drawBar=false;
        if(this._owner.slider)  {
            drawBar=this._owner.slider==this;
        }else {
            drawBar=this._owner.hover_slider==this;
        }
        if(drawBar) {
            let vstart=(Use_ImTransform)?drawlist.GetVertexSize():0;
            let scroll=this.GetScrollType();
            if(scroll.isScrollH)  {
                drawlist.AddRectFilled(this._scrollHxy, this._scrollHxy2, this.scrollbarColor, 4);
            }
            if(scroll.isScrollW)  {
                drawlist.AddRectFilled(this._scrollWxy, this._scrollWxy2, this.scrollbarColor, 4);
            }
            if(Use_ImTransform) {
                drawlist.Transform(this._world, vstart);
            }
        }
    }

    GetScrollType():ScrollType
    {
        let isScrollH;
        let isScrollW;
        switch(this.scrollType) {
        case ESliderType.eVertical:
            isScrollH=true;
            break;
        case ESliderType.eHorizontal:
            isScrollW=true;
            break;
        case ESliderType.eBoth:
            isScrollW=true;
            isScrollH=true;
            break;
        }
        return {isScrollH:isScrollH, isScrollW:isScrollW};
    }

    CalRect(parent:zlUIWin):void 
    {
        super.CalRect(parent);
        this.CalScrollRect();
    }
    CalScrollRect():void
    {
        let scroll=this.GetScrollType();
        if(scroll.isScrollH)  {
            let h=this.h-this.borderWidth-this.borderWidth;
            let mx=this._screenMax.x-this.borderWidth;
            let scaleh=h/(h+this.scroll_max);
            this._scrollHxy.Set(mx-8, this._screenXY.y+this.borderWidth+this.scroll_value*scaleh);
            let mh=this.scroll_max>0?h*scaleh:h;
            this._scrollHxy2.Set(mx, this._scrollHxy.y+mh);
        }
        if(scroll.isScrollW)  {
            let w=this.w-this.borderWidth-this.borderWidth;
            let my=this._screenMax.y-this.borderWidth;
            let scalew=w/(w+this.scroll_max);
            this._scrollWxy.Set(this._screenXY.x+this.borderWidth+this.scroll_value*scalew, my-8);
            let mw=this.scroll_max>0?w*scalew:w;
            this._scrollWxy2.Set(this._scrollWxy.x+mw, my);
        }
    }

    ArrangeChild(obj:zlUIWin, type:ESliderType):void 
    {
        this.pChild.push(obj);
        this._is_scrollvalue_change=true;
    }

    scrollType:ESliderType=ESliderType.eVertical;
    scrollbarColor:number=0x40c0c0c0;
    scroll_value:number=0;
    scroll_max:number=0;
    is_item_mode:boolean=false;
    mouse_wheel_speed:number=20;

    _scrollHxy:ImGui.Vec2=new ImGui.Vec2;
    _scrollHxy2:ImGui.Vec2=new ImGui.Vec2;
    _scrollWxy:ImGui.Vec2=new ImGui.Vec2;
    _scrollWxy2:ImGui.Vec2=new ImGui.Vec2;

    _first_pos:ImGui.Vec2;
    _first_value:number;
    _first_scrollbar:boolean;
    _is_scrollvalue_change:boolean=false;
}

interface ImageFont
{
    width:number;
    height:number;
    offset_x:number;
    offset_y:number;
    texure:TexturePack;   
    uv1?:ImGui.ImVec2;
    uv2?:ImGui.ImVec2;
}

export function ParseImageFont(toks:string[], mgr:zlUIMgr):ImageFont
{
    let tex=mgr.GetTexture(toks[1]);
    if(!tex.uv1) {
        UpdateTexturePack(tex);
    }
    return {
        width:parseInt(toks[2]),
        height:parseInt(toks[3]),
        offset_x:parseInt(toks[4]),
        offset_y:parseInt(toks[5]),
        texure:tex,
        uv1:tex.uv1,
        uv2:tex.uv2
    }
}

interface ImageText
{
    screenXY:ImGui.ImVec2;
    screenMax:ImGui.ImVec2;
    imageFont:ImageFont;
}

export {zlUIImageText as UIImageText}

export class zlUIImageText extends zlUIWin
{
    constructor(own:zlUIMgr)
    {
        super(own);
        this._csid="ImageText";
    }

    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "imagelist":
            this.image_font.push(ParseImageFont(toks, this._owner));
            break;
        case "imagew": {
            let tex=this._owner.GetTexture(toks[1]);
            let w=Number.parseInt(toks[2]);
            let h=Number.parseInt(toks[3]);
            let n=Number.parseInt(toks[4]);
            if(!tex.uv1) {
                UpdateTexturePack(tex);
            }
            let u=(tex.uv2.x-tex.uv1.x)/n;
            for(let i=0;i<n;i++) {
                this.image_font.push({
                    width:w,
                    height:h,
                    offset_x:0,
                    offset_y:0,
                    texure:tex,
                    uv1:new ImGui.ImVec2(tex.uv1.x+u*i, tex.uv1.y),
                    uv2:new ImGui.ImVec2(tex.uv1.x+u*(i+1), tex.uv2.y)
                })
            }
            break; }
        case "imageh": {
            let tex=this._owner.GetTexture(toks[1]);
            let w=Number.parseInt(toks[2]);
            let h=Number.parseInt(toks[3]);
            let n=Number.parseInt(toks[4]);
            if(!tex.uv1) {
                UpdateTexturePack(tex);
            }
            let v=(tex.uv2.y-tex.uv1.y)/n;
            for(let i=0;i<n;i++) {
                this.image_font.push({
                    width:w,
                    height:h,
                    offset_x:0,
                    offset_y:0,
                    texure:tex,
                    uv1:new ImGui.ImVec2(tex.uv1.x, tex.uv1.y+v*i),
                    uv2:new ImGui.ImVec2(tex.uv2.x, tex.uv1.y+v*(i+1))
                })
            }
            break; }
        case "text":
            this.SetText(toks[1]);
            break;
        case "ascii":
            this.ascii[ParseText(toks[1])]=parseInt(toks[2]);
            break;
        case "textalignw":
            switch(ParseAlign(toks[1])) {
            case Align.Left:
                this.textAnchor.x=0;
                break;
            case Align.Center:
                this.textAnchor.x=0.5;
                break;
            case Align.Right:
                this.textAnchor.x=1;
                break;
            }
            break;
        case "textalignh":
            switch(ParseAlign(toks[1])) {
            case Align.Top:
                this.textAnchor.y=0;
                break;
            case Align.Center:
                this.textAnchor.y=0.5;
                break;
            case Align.Down:
                this.textAnchor.y=1;
                break;
            }
            break;
        case "textanchor":
            this.textAnchor.x=Number.parseFloat(toks[1]);
            this.textAnchor.y=Number.parseFloat(toks[2]);
            break;
        case "fontspace":
            this.font_space=Number.parseInt(toks[1]);
            break;
        case "color":
            this.color=ParseColor(toks[1]);
            break;
        default:
            return await super.ParseCmd(name,toks);
        }
        return true;
    }

    Copy(obj: zlUIWin): void 
    {
        super.Copy(obj);
        let o=obj as zlUIImageText;
        this.image_font=o.image_font;
        this.ascii=Clone(o.ascii);
        this.font_space=o.font_space;
        this.textAnchor=Clone(o.textAnchor);
        this.text_width=o.text_width;
        this.text_height=o.text_height;
        this.color=o.color;
        this.SetText(o.text)
    }
    Clone(): zlUIWin {
        let obj=new zlUIImageText(this._owner);
        obj.Copy(this);
        return obj;
    }

    PaintImageText(drawlist:ImGui.ImDrawList):void 
    {
        for(let image of this.imageText)
        {
            let imgFont=image.imageFont;
            let tex=imgFont.texure;            
            drawlist.AddImage(tex.texture._texture,
                image.screenXY, image.screenMax, 
                imgFont.uv1, imgFont.uv2, this.color);
        }
    }

    Paint(drawlist:ImGui.ImDrawList):void 
    {
        if(Use_ImTransform) {
            if(this._world) {
                const vstart=drawlist.GetVertexSize();
                this.PaintImageText(drawlist);
                drawlist.Transform(this._world, vstart);
            }
        }else {
            this.PaintImageText(drawlist);
        }
        super.Paint(drawlist);
    }
    CalRect(parent: zlUIWin): void {
        super.CalRect(parent);
        this.imageText=[];
        let tw=0;
        let th=0;
        for(let c of this.text) {
            let ascii=this.ascii[c];
            if(!ascii)
                continue;
            let imageFont=this.image_font[ascii];
            if(!imageFont)
                continue;
            tw+=imageFont.width+this.font_space;
            th=Math.max(th, imageFont.height);

            this.imageText.push({
                screenXY:new ImGui.ImVec2,
                screenMax:new ImGui.ImVec2,
                imageFont:imageFont,
            })
        }
        this.text_width=tw;
        this.text_height=th;
        let x=this._screenXY.x+(this.w-tw)*this.textAnchor.x;
        let y=this._screenXY.y+(this.h-th)*this.textAnchor.y;
        for(let im of this.imageText) {
            let tx=x+im.imageFont.offset_x;
            let ty=y+im.imageFont.offset_y;
            im.screenXY.Set(tx,ty);
            im.screenMax.Set(tx+im.imageFont.width, ty+im.imageFont.height);
            x+=im.imageFont.width+this.font_space;
        }
    }

    SetText(text:string):void
    {
        this.text=text;
        this.SetCalRect();
    }

    set Text(text:string) { this.SetText(text);}

    text:string;
    image_font:ImageFont[]=[];
    ascii:{[key:string]:number}={};
    font_space:number=0;
    textAnchor:Vec2={x:0.5, y:0.5};
    text_width:number;
    text_height:number;
    color:number=0xffffffff;
    imageText:ImageText[];
}

export class zlTexturePack
{
    constructor(own:zlUIMgr)
    {
        this.owner=own;
    }
    Destroy():void 
    {
        this.textures.forEach(t=>{
            t.Destroy();
        })
    }

    async Parse(lines:string[]):Promise<boolean>
    {
        for(let line of lines) {
            let toks:string[]=line.toLowerCase().split(/\s/g).filter(e=>e);
            if(toks.length>0)   {
                await this.ParseCmd(toks[0], toks);
            }
        }
        return true;
    }
    async ParseCmd(name:string, toks:string[]):Promise<void>
    {
        switch(name) {
        case 'image':
            this.current=new ImGui_Impl.Texture;
            var image=new Image;
            let loadproc=LoadImage(image).then(r=>{
                this.current.Update(image);
                console.log("image.onload", this.current);
            });
            image.crossOrigin="anonymous";
            image.src=this.owner.path + toks[1];
            await loadproc;
            this.textures.push(this.current);
            break;
        case 'subimage':
            let k=toks[1].toLowerCase();
            this.cache[k]={
                x1:Number.parseInt(toks[2]),
                y1:Number.parseInt(toks[3]),
                x2:Number.parseInt(toks[4]),
                y2:Number.parseInt(toks[5]),
                texture:this.current
            }
            break;
        }
    }

    owner:zlUIMgr;
    current:ImGui_Impl.Texture;
    cache:{[key:string]:TexturePack}={}
    textures:ImGui_Impl.Texture[]=[];
}

enum ETrackCmd
{
    None,
    SetPos,
    SetRect,
    SetWidth,
    SetHeight,
    Move,
    MoveLerp,
    MoveBezier,
    SetX,
    MoveX,
    MoveXLerp,
    SetY,
    MoveY,
    MoveYLerp,
    SetScale,
    Scale,
    ScaleLerp,
    Image,
    SetAlpha,
    Alpha,
    AlphaLerp,
    Hide,
    Show,
    FlipW,
    FlipH,
    SetRotate,
    Rotate,
    RotateLerp,
    SetColor,
    Color,
    ColorLerp,
    Width,
    WidthLerp,
    Height,
    HeightLerp,
    StopAni,
    PlayAni,
    AniSpeed,
    AniStartEnd,
    PlaySound,
    SoundFade,
    Volume,
    SetImageClip,
    ImageClip,
    ImageClipLerp,
    PlayTrack,
    StopTrack,
    Enable,
    Disable,
    Text,
}

interface InitData
{
    pos?:Vec2;
    wh?:Vec2;
    color?:Vec4;
    alpha?:number;
    scale?:number;
    rotate?:number;
}

interface ITrackCmd
{
    cmd:ETrackCmd;
    time_from:number;
    time_to:number;
    
    period?:number;
    pos?:Vec2;
    rotate?:number;
    scale?:number;
    wh?:Vec2;
    rect?:Vec4;
    color?:Vec4;
    alpha?:number;
    speed?:number;
    volume?:number;
    name?:string;
    image?:string;
    text?:string;
    start?:number;
    end?:number;
    count?:number;
    bezier?:Bezier;

    isInit?:boolean;
    initData?:InitData;
}

const TimeUint=1/30;

export {zlTrack as Track}

export class zlTrack
{
    constructor()
    {
    }

    Parse(lines:string[], start:number):number
    {
        for(;start<lines.length;start++) {
            let line=lines[start];
            let toks:string[]=line.toLowerCase().split(/\s/g).filter(e=>e);
            if(toks.length>0)   {
                let tok=toks[0];
                if(tok==="}") {
                    return start;
                }
                else if(tok.startsWith("//") || tok.startsWith("#"))   {
                }else {
                    this.ParseCmd(tok, toks);
                }
            }
        }
        return start;
    }
    ParseCmd(name:string, toks:string[]):boolean 
    {
        let time1:number=Number.parseFloat(toks[1])*TimeUint;
        let time2:number;
        switch(name) {
        case "{":
            break;
        case "name":
            this.name=toks[1];
            break;
        case "setpos":
            this.cmd.push({
                cmd:ETrackCmd.SetPos,
                time_from:time1,
                time_to:time1,
                pos:{
                    x:Number.parseFloat(toks[2]),
                    y:Number.parseFloat(toks[3]),
                }
            });
            break;
        case "setrect":
            this.cmd.push({
                cmd:ETrackCmd.SetRect,
                time_from:time1,
                time_to:time1,
                rect:{
                    x:Number.parseFloat(toks[2]),
                    y:Number.parseFloat(toks[3]),
                    z:Number.parseFloat(toks[4]),
                    w:Number.parseFloat(toks[5]),
                }
            })
            break;
        case "setwidth":
            this.cmd.push({
                cmd:ETrackCmd.SetWidth,
                time_from:time1,
                time_to:time1,
                wh:{x:Number.parseFloat(toks[2]),y:0}
            })
            break;
        case "setheight":
            this.cmd.push({
                cmd:ETrackCmd.SetHeight,
                time_from:time1,
                time_to:time1,
                wh:{x:0,y:Number.parseFloat(toks[2])}
            })
            break;
        case "move":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Move,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:Number.parseFloat(toks[3]),
                    y:Number.parseFloat(toks[4]),
                },
            });            
            break;
        case "movelerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveLerp,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:Number.parseFloat(toks[3]),
                    y:Number.parseFloat(toks[4]),
                },
                speed:Number.parseFloat(toks[5]),
            });
            break;
        case "movebezier": {
            let bezier:Bezier=new Bezier;
            bezier.ParseCmd(name, toks.splice(3));
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveBezier,
                time_from:time1,
                time_to:time2,
                bezier:bezier,
            });
            break; }
        case "setx":
            this.cmd.push({
                cmd:ETrackCmd.SetX,
                time_from:time1,
                time_to:time1,
                pos:{
                    x:Number.parseFloat(toks[2]),
                    y:0,
                }
            });        
            break;
        case "movex":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveX,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:Number.parseFloat(toks[3]),
                    y:0,
                },
            });            
            break;
        case "movexlerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveXLerp,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:Number.parseFloat(toks[3]),
                    y:0
                },
                speed:Number.parseFloat(toks[4]),
            });
            break;
        case "sety":
            this.cmd.push({
                cmd:ETrackCmd.SetY,
                time_from:time1,
                time_to:time1,
                pos:{
                    x:0,
                    y:Number.parseFloat(toks[2]),
                }
            });        
            break;
        case "movey":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveY,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:0,
                    y:Number.parseFloat(toks[3]),
                },
            });            
            break;
        case "moveylerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.MoveYLerp,
                time_from:time1,
                time_to:time2,
                pos: {
                    x:0,
                    y:Number.parseFloat(toks[3])
                },
                speed:Number.parseFloat(toks[4]),
            });
            break;
        case "setscale":
            this.cmd.push({
                cmd:ETrackCmd.SetScale,
                time_from:time1,
                time_to:time1,
                scale:Number.parseFloat(toks[2])
            })
            break;
        case "scale":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Scale,
                time_from:time1,
                time_to:time2,
                scale:Number.parseFloat(toks[3]),
            })
            break;
        case "scalelerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.ScaleLerp,
                time_from:time1,
                time_to:time2,
                scale:Number.parseFloat(toks[3]),
                speed:Number.parseFloat(toks[4])
            })
            break;
        case "image":
            this.cmd.push({
                cmd:ETrackCmd.Image,
                time_from:time1,
                time_to:time1,
                image:toks[2],
            })
            break;
        case "setalpha":
            this.cmd.push({
                cmd:ETrackCmd.SetAlpha,
                time_from:time1,
                time_to:time1,
                alpha:Number.parseFloat(toks[2])/255
            });        
            break;
        case "alpha":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Alpha,
                time_from:time1,
                time_to:time2,
                alpha:Number.parseFloat(toks[3])/255
            });            
            break;
        case "alphalerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.AlphaLerp,
                time_from:time1,
                time_to:time2,
                alpha:Number.parseFloat(toks[3]),
                speed:Number.parseFloat(toks[4]),
            });
            break;
        case "hide":
            this.cmd.push({
                cmd:ETrackCmd.Hide,
                time_from:time1,
                time_to:time1,
            })
            break;
        case "show":
            this.cmd.push({
                cmd:ETrackCmd.Show,
                time_from:time1,
                time_to:time1
            })
            break;
        case "flipw":
            this.cmd.push({
                cmd:ETrackCmd.FlipW,
                time_from:time1,
                time_to:time1
            })
            break;
        case "fliph":
            this.cmd.push({
                cmd:ETrackCmd.FlipH,
                time_from:time1,
                time_to:time1
            })
            break;
        case "setrotate":
            this.cmd.push({
                cmd:ETrackCmd.SetRotate,
                time_from:time1,
                time_to:time1,
                rotate:Number.parseFloat(toks[2])*Math.PI/180
            })
            break;
        case "rotate":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Rotate,
                time_from:time1,
                time_to:time2,
                rotate:Number.parseFloat(toks[3])*Math.PI/180
            });            
            break;
        case "rotatelerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.RotateLerp,
                time_from:time1,
                time_to:time2,
                rotate:Number.parseFloat(toks[3])*Math.PI/180,
                speed:Number.parseFloat(toks[4])
            });            
            break;
        case "setcolor":
        case "color":
        case "colorlerp":
            break;
        case "width":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Width,
                time_from:time1,
                time_to:time2,
                wh: {
                    x:Number.parseFloat(toks[3]),
                    y:0,
                },
            });            
            break;
        case "widthlerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.WidthLerp,
                time_from:time1,
                time_to:time2,
                wh: {
                    x:Number.parseFloat(toks[3]),
                    y:0
                },
                speed:Number.parseFloat(toks[4]),
            });
            break;
        case "height":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.Height,
                time_from:time1,
                time_to:time2,
                wh: {
                    x:0,
                    y:Number.parseFloat(toks[3]),
                },
            });            
            break;
        case "heightlerp":
            time2=Number.parseFloat(toks[2])*TimeUint;
            this.cmd.push({
                cmd:ETrackCmd.HeightLerp,
                time_from:time1,
                time_to:time2,
                wh: {
                    x:0,
                    y:Number.parseFloat(toks[3])
                },
                speed:Number.parseFloat(toks[4]),
            });
            break;
        case "stopani":
        case "playani":
        case "anispeed":
        case "anistartend":
            break;
        case "playsound":
        case "soundfade":
        case "volume":
            break;
        case "setimageclip":
        case "imageclip":
        case "imagecliplerp":
            break;
        case "playtrack":
            this.cmd.push({
                cmd:ETrackCmd.PlayTrack,
                time_from:time1,
                time_to:time1,
                name:toks[2],
                count:Number.parseInt(toks[3])
            });
            break;
        case "stoptrack":
            this.cmd.push({
                cmd:ETrackCmd.StopTrack,
                time_from:time1,
                time_to:time1,
                name:toks[2],
            });
            break;
        case "enable":
            this.cmd.push({
                cmd:ETrackCmd.Enable,
                time_from:time1,
                time_to:time1,
            })
            break;
        case "disable":
            this.cmd.push({
                cmd:ETrackCmd.Disable,
                time_from:time1,
                time_to:time1,
            })
            break;
        case "text":
            this.cmd.push({
                cmd:ETrackCmd.Text,
                time_from:time1,
                time_to:time1,
                text:ParseText(toks[2]),
            })
            break;
        default:
            console.log("zlUITrack " + this.name + " unknow param " + name);
            return false;
        }
        return true;
    }
    
    Copy(o:zlTrack)
    {
        this.name=o.name;
        this.cmd=Clone(o.cmd);        
    }

    Clone():zlTrack
    {
        let trk=new zlTrack;
        trk.Copy(this);
        return trk;
    }
    

    Play(loop:number) {
        this.time=0;
        this.loop=loop;
        this.period=0;
        this.wait_cmd=[];
        for(let cmd of this.cmd) {
            cmd.isInit=false;
            cmd.period=cmd.time_to-cmd.time_from;
            this.period=Math.max(this.period, cmd.time_to);
            this.wait_cmd.push(cmd);
        }
    }

    Refresh(ti:number):boolean
    {
        for(let i=this.wait_cmd.length-1;i>=0;i--) {
            let cmd=this.wait_cmd[i];
            if(this.time<cmd.time_from)
                continue;
            let obj=this.object;
            let t=cmd.period>0?(this.time-cmd.time_from)/cmd.period:0;
            switch(cmd.cmd) {
            case ETrackCmd.SetPos:
                obj.x=cmd.pos.x;
                obj.y=cmd.pos.y;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetRect:
                obj.x=cmd.rect.x;
                obj.y=cmd.rect.y;
                obj.w=cmd.rect.z-cmd.rect.x;
                obj.h=cmd.rect.w-cmd.rect.y;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetWidth:
                obj.w=cmd.wh.x;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetHeight:
                obj.h=cmd.wh.y;
                obj.SetCalRect();
                break;
            case ETrackCmd.Move:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={pos:{x:obj.x,y:obj.y}}
                }
                obj.x=cmd.initData.pos.x+(cmd.pos.x-cmd.initData.pos.x)*t;
                obj.y=cmd.initData.pos.y+(cmd.pos.y-cmd.initData.pos.y)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveLerp:
                obj.x+=(cmd.pos.x-obj.x)*cmd.speed*ti;
                obj.y+=(cmd.pos.y-obj.y)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveBezier: {
                let p=cmd.bezier.GetPoint(t);
                obj.x=p.x;
                obj.y=p.y;
                obj.SetCalRect();
                break; }
            case ETrackCmd.SetX:
                obj.x=cmd.pos.x;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveX:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={pos:{x:obj.x,y:obj.y}}
                }
                obj.x=cmd.initData.pos.x+(cmd.pos.x-cmd.initData.pos.x)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveXLerp:
                obj.x+=(cmd.pos.x-obj.x)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetY:
                obj.y=cmd.pos.y;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveY:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={pos:{x:obj.x,y:obj.y}}
                }
                obj.y=cmd.initData.pos.y+(cmd.pos.y-cmd.initData.pos.y)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.MoveYLerp:
                obj.y+=(cmd.pos.y-obj.y)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetScale:
                obj.scale=cmd.scale;
                obj.SetCalRect();
                break;
            case ETrackCmd.Scale:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={scale:obj.scale}
                }
                obj.scale=cmd.initData.scale+(cmd.scale-cmd.initData.scale)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.ScaleLerp:
                obj.scale+=(cmd.scale-obj.scale)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.Image:
                obj.Image=cmd.image;
                break;
            case ETrackCmd.SetAlpha:
                obj.alpha=cmd.alpha;
                break;
            case ETrackCmd.Alpha:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={alpha:obj.alpha}
                }
                obj.alpha=cmd.initData.alpha+(cmd.alpha-cmd.initData.alpha)*t;
                break;
            case ETrackCmd.AlphaLerp:
                obj.alpha+=(cmd.alpha-obj.alpha)*cmd.speed*ti;
                break;
            case ETrackCmd.Hide:
                obj.isVisible=false;
                break;
            case ETrackCmd.Show:
                obj.isVisible=true;
                break;
            case ETrackCmd.FlipW:
            case ETrackCmd.FlipH:
                console.log("TODO zlTrack", cmd);
                break;
            case ETrackCmd.SetRotate:
                obj.rotate=cmd.rotate;
                obj.SetCalRect();
                break;
            case ETrackCmd.Rotate:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={rotate:obj.rotate}
                }
                obj.rotate=cmd.initData.rotate+(cmd.rotate-cmd.initData.rotate)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.RotateLerp:
                obj.rotate+=(cmd.rotate-obj.rotate)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.SetColor:
                obj.Color=cmd.color;
                break;
            case ETrackCmd.Color:
                let c=obj.Color;
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={color:c}
                }
                c.x=cmd.initData.color.x+(cmd.color.x-cmd.initData.color.x)*t;
                c.y=cmd.initData.color.y+(cmd.color.y-cmd.initData.color.y)*t;
                c.z=cmd.initData.color.z+(cmd.color.z-cmd.initData.color.z)*t;
                c.w=cmd.initData.color.w+(cmd.color.w-cmd.initData.color.w)*t;
                obj.Color=c;
                break;
            case ETrackCmd.ColorLerp: {
                let sp=cmd.speed*ti;
                let c=obj.Color;
                c.x+=(cmd.color.x-c.x)*sp;
                c.y+=(cmd.color.y-c.y)*sp;
                c.z+=(cmd.color.z-c.z)*sp;
                c.w+=(cmd.color.w-c.w)*sp;
                obj.Color=c;
                break; }
            case ETrackCmd.Width:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={wh:{x:obj.w,y:obj.h}}
                }
                obj.w=cmd.initData.wh.x+(cmd.wh.x-cmd.initData.wh.x)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.WidthLerp:
                obj.w+=(cmd.wh.x-obj.w)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.Height:
                if(!cmd.isInit) {
                    cmd.isInit=true;
                    cmd.initData={wh:{x:obj.w,y:obj.h}}
                }
                obj.h=cmd.initData.wh.y+(cmd.wh.y-cmd.initData.wh.y)*t;
                obj.SetCalRect();
                break;
            case ETrackCmd.HeightLerp:
                obj.h+=(cmd.wh.y-obj.h)*cmd.speed*ti;
                obj.SetCalRect();
                break;
            case ETrackCmd.PlayTrack:
                obj._owner.PlayTrack(cmd.name, cmd.count);
                break;
            case ETrackCmd.StopTrack:
                obj._owner.StopTrack(cmd.name);
                break;
            case ETrackCmd.Enable:
                obj.isDisable=false;
                break;
            case ETrackCmd.Disable:
                obj.isDisable=true;
                break;
            case ETrackCmd.Text:
                obj.Text=cmd.text;
                break;
            default:
                console.log("TODO zlTrack", cmd);
                break;
            }

            if(this.time>cmd.time_to) {
                this.wait_cmd.splice(i,1);
            }
        }
        this.time+=ti;
        if(this.time>this.period && this.wait_cmd.length==0) {
            if(this.loop>=1) {
                this.Play(this.loop-1);
            }else if(this.loop<0) {
                this.Play(this.loop);
            }else {
                return false;
            }
        }
        return true;
    }

    name:string;
    cmd:ITrackCmd[]=[];
    wait_cmd:ITrackCmd[]=[];
    loop:number;
    time:number;
    period:number;
    object:zlUIWin;
}

export {zlTrackGroup as TrackGroup}

export class zlTrackGroup
{
    on_play_over:((this:zlTrackGroup)=>any)|null;

    constructor(own:zlUIMgr)
    {
        this._owner=own;
    }

    Play(loop:number)
    {
        this.is_play=true;
        this.run_track=[];
        if(loop>0) loop--;
        for(let trk of this.track) {
            if(!trk.object) {
                trk.object=this._owner.GetUI(trk.name);
            }    
            trk.Play(loop);
            this.run_track.push(trk);
        }
    }
    Stop()
    {
        this.is_play=false;
        this.run_track=[];
    }

    Parse(lines:string[], start:number):number
    {
        for(;start<lines.length;start++) {
            let line=lines[start];
            let toks:string[]=line.toLowerCase().split(/\s/g).filter(e=>e);
            if(toks.length>0)   {
                let tok=toks[0];
                if(tok==="track") {
                    let trk=new zlTrack;
                    if(toks.length>1) {
                        trk.name=toks[1];
                    }
                    this.track.push(trk);
                    start=trk.Parse(lines, start+1);
                    trk.object=this._owner.GetUI(trk.name);
                }
                else if(tok==='clone')  
                {
                    //TODO
                }
                else if(tok==='name')  
                {
                    this.name=toks[1];
                }
                else if(tok==='}')  
                {
                    return start;
                }
            }
        }        
        return start;
    }

    Refresh(ti:number):boolean
    {
        let work=false;
        for(let i=this.run_track.length-1;i>=0;i--) {
            let trk=this.run_track[i];
            if(trk.Refresh(ti)) {
                work=true;
            }else {
                this.run_track.splice(i,1);
            }
        }
        if(!work) {
            this.is_play=false;
        }
        return work;
    }

    _owner:zlUIMgr;
    name:string;
    weight:number=1;
    is_play:boolean=false;
    track:zlTrack[]=[];
    run_track:zlTrack[]=[];
}

export {zlTrackMgr as TrackMgr}

export class zlTrackMgr
{
    constructor(mgr:zlUIMgr)
    {
        this._owner=mgr;
    }    

    Parse(lines:string[], start:number):number
    {
        let line=lines[start];
        let toks:string[]=line.toLowerCase().split(/\s/g).filter(e=>e);
        if(toks.length>0)   {
            let tok=toks[0];
            if(tok==="trackgroup") {
                let trk=new zlTrackGroup(this._owner);
                if(toks.length>1) {
                    trk.name=toks[1];
                }
                start=trk.Parse(lines, start+1);
                this.track[trk.name]=trk;
            }
        }
        return start;
    }

    Play(name:string, loop:number)
    {
        let trk=this.track[name];
        trk.Play(loop);
        this.run_track.push(trk);
    }

    Refresh(ti:number):boolean
    {
        let work=false;
        for(let i=this.run_track.length-1;i>=0;i--) {
            let trk=this.run_track[i];
            trk.Refresh(ti);
            work=true;
            if(!trk.is_play) {
                this.run_track.splice(i,1);
            }
        }
        this.is_play=work;
        return work;
    }

    _owner:zlUIMgr;
    track:{[key:string]:zlTrackGroup}={}
    run_track:zlTrackGroup[]=[];
    is_play:boolean=false;
}

export {zlUIMgr as UIMgr}

export class zlUIMgr extends zlUIWin
{
    constructor()
    {
        super(undefined)
        this._owner=this;
        this.offset.x=0;
        this.offset.y=0;
        this.track=new zlTrackMgr(this);
    }

    on_click: ((this: zlUIWin, obj: zlUIWin) => any) | null; 
    on_edit: ((this: zlUIWin, obj: zlUIWin) => any) | null; 
    on_popup_closed: ((this: zlUIWin, obj: zlUIWin) => any) | null; 

    async ParseCmd(name:string, toks:string[]):Promise<boolean>
    {
        switch(name) {
        case "defaultborderwidth":
            break;
        case "defaultscreensize":
            this.default_w=this.w=Number.parseInt(toks[1]);
            this.default_h=this.h=Number.parseInt(toks[2]);
            break;
        case "defaultpanelcolor":
            this.default_panel_color=ParseColor(toks[1]);
            break;
        case "loadpackimage":
            await this.LoadTexturePack(toks[1], this.path);
            break;
        case "include":
            await this.Load(toks[1], this.path);
            break;
        case "defaultcombomenu":
            this.default_combo_menu=this.GetUI(toks[1]).Clone() as zlUISlider;
            break;
        case "defaultcomboitem":
            this.default_combo_item=this.GetUI(toks[1]) as zlUIButton;
            break;
        case "font":
            let id=Number.parseInt(toks[1]);
            let font=ImGui.CreateFont(toks[2].replace(/\\s/g," "), Number.parseInt(toks[3]), toks[4]);
            this.SetFont(id, font);
            break;
        case "mergefont": {
            let id=Number.parseInt(toks[1]);            
            let font=ImGui.CreateFont(toks[4].replace(/\\s/g," "), Number.parseInt(toks[5]), toks[6]);
            font.AddFontRange(ParseText(toks[2]).charCodeAt(0), ParseText(toks[3]).charCodeAt(0));
            this.fonts[id].MergeFont(font);
            break; }
        case "createfont": {
            let url=this.path+toks[2];
            let fontface=new FontFace(toks[1], `url(${url})`);
            await fontface.load().then(r=>{console.log("FontFace load",r)})
            document.fonts.add(fontface);
            break; }
        case "playtrack":
            this.track.Play(toks[1], Number.parseInt(toks[2]));
            break;
        default:
            return super.ParseCmd(name, toks);
        }
        return true;
    }

    Destroy():void 
    {
        if(this.texture)    {
            this.texture.Destroy();
            this.texture=undefined;
        }
    }

    async Load(file:string, path:string):Promise<boolean>
    {
        console.log("zlUIMgr Load "+ path + file);
        this.path=path;
        this.Name="Root";
        this.isCalRect=true;

        let t=await fetch(path + file).then(r=>{           
            return r.text();
        }).catch(r=>{
            console.log("Load " + path + file + " failed");
            return "";
        });        
        return await this.Parse(t.split(/\r|\n/g).filter(e=>e), 0) > 0;
    }
    async LoadTexturePack(file:string, path:string):Promise<boolean>
    {
        this.path=path;
        if(!this.texture)   {
            this.texture=new zlTexturePack(this);
        }
        let t = await fetch(path + file).then(r=>{
            return r.text();
        }).catch(r=>{
            console.log("LoadTexturePack", r);
            return "";
        });
        return await this.texture.Parse(t.split(/\r|\n/g).filter(e=>e));
    }

    Create(name:string):zlUIWin
    {
        switch(name) {
        case 'win':
            return new zlUIWin(this);
        case 'panel':
            return new zlUIPanel(this);
        case 'image':
            return new zlUIImage(this);
        case 'button':
            return new zlUIButton(this);
        case 'check':
            return new zlUICheck(this);
        case 'combo':
            return new zlUICombo(this);
        case 'edit':
            return new zlUIEdit(this);
        case 'slider':
            return new zlUISlider(this);
        case 'imagetext':
            return new zlUIImageText(this);
        default:
            console.log("zlUIMgr unknow object " + name);
            return undefined;
        }
    }
    Refresh(ti:number, parent?:zlUIWin):void 
    {
        this.hover_slider=this.GetUIWin(this.mouse_pos, "Slider");
        let notify=this.GetNotify(this.mouse_pos);
        let isDown=this.any_pointer_down;
        let firstDown=(!this.prevDown && isDown);
        this.prevDown=isDown;
        if(notify) {
            if(this.notify!=notify)  {
                if(this.notify) {
                    this.notify.isDown=false;
                }
                if(firstDown)    {
                    this.notify=notify;
                    this.notify.OnNotify();
                }
                if(this.on_notify) {
                    this.on_notify(notify);
                }
            }else if(firstDown) {
                this.notify.OnNotify();
            }
            if(this.notify==notify&&this.notify.isDown&&!isDown&&this.notify.Name)  {
                let ox=Math.abs(this.mouse_pos.x-this.first_pos_x);
                let oy=Math.abs(this.mouse_pos.y-this.first_pos_y);
                if(ox<=this.touch_tolerance&&oy<=this.touch_tolerance) {
                    this.notify.OnClick();
                    if(this.on_click)   {
                        this.on_click(this.notify);
                    }
                }
            }
            if(firstDown)   {
                this.first_pos_x=this.mouse_pos.x;
                this.first_pos_y=this.mouse_pos.y;
                if(notify.isCanDrag) {
                    this.drag=notify;
                    this.drag_x=notify.x;
                    this.drag_y=notify.y;
                }
            }
            if(!notify.isDisable)   {
                notify.isDown=isDown;
            }
            if(this.hover!=notify)  {
                if(this.hover) {
                    this.hover.isDown=false;
                }
                if(this.on_hover) {
                    this.on_hover(notify);
                }
                if(notify.on_hover) {
                    notify.on_hover(notify);
                }
            }
            this.hover=notify;
        }
        if(this.drag)   {
            this.drag.x=this.drag_x+this.mouse_pos.x-this.first_pos_x;
            this.drag.y=this.drag_y+this.mouse_pos.y-this.first_pos_y;
            this.LimitRect(this.drag);
            this.drag.SetCalRect();
        }
        if(this.popup) {
            if(isDown&&!Inside(this.mouse_pos, this.popup._screenXY, this.popup._screenMax))    {
                this.ClosePopup();
            }
        }
        if(!isDown) {
            this.drag=undefined;
        }
        this.track.Refresh(ti);

        this.refresh_count=0;
        this.calrect_count=0;
        super.Refresh(ti, undefined);
        if(this.nextEdit) {
            this.NextEdit(this.nextEdit);
            this.nextEdit=undefined;
        }
        this.ClearPaintout(this);
    }

    ClearPaintout(o:zlUIWin)
    {
        o._isPaintout=false;
        for(let ch of o.pChild) {
            if(!ch.isVisible)
                continue;
            this.ClearPaintout(ch);
        }
    }

    Paint(drawlist: ImGui.ImDrawList): void {
        this.paint_count=0;
        super.Paint(drawlist);
    }

    ScaleWH(w:number, h:number, mode:ScaleMode):void 
    {
        var sx=w/this.w;
        var sy=h/this.h;
        switch(mode) {
        case ScaleMode.AspectRatio:
            var scale=1;
            if(sx>sy)   {
                scale=sy;
                this.x=(w-this.w*scale)*0.5;
                this.y=0;
            }else {
                scale=sx;
                this.x=0;
                this.y=(h-this.h*scale)*0.5;
            }
            super.Scale(scale);
            break;
        case ScaleMode.Stretch:
            this.x=0;
            this.y=0;
            super.Stretch(sx,sy);
            break;
        }
        this.SetCalRect();
    }
    GetFont(id:number):ImGui.Font
    {
        if(id<this.fonts.length&&this.fonts[id])    {
            return this.fonts[id];
        }
        return ImGui.GetFont();
    }
    SetFont(id:number, font:ImGui.Font) {
        this.fonts[id]=font;
    }
    GetTexture(name:string):TexturePack
    {
        if(!this.texture)
            return undefined;
        let img=this.texture.cache[name.toLowerCase()];
        if(!img) {
            console.log("texture not found " + name);
            return undefined;
        }
        return img;
    }
    Popup(ui:zlUIWin):void
    {
        ui.isVisible=true;
        this.popup=ui;
    }
    ClosePopup():void
    {
        if(this.popup)  {
            this.popup.isVisible=false;
            if(this.on_popup_closed) {
                this.on_popup_closed(this.popup);
            }
            this.popup=undefined;
        }
    }    
    NextEdit(current:zlUIEdit)
    {
        let wait:zlUIWin[]=[this];
        let list:zlUIEdit[]=[];
        while(wait.length>0) {
            let win=wait.shift();
            if(win) {
                for(let ch of win.pChild) {
                    if(!ch.isVisible||!ch._isPaintout)
                    {
                        continue;
                    }
                    wait.push(ch);
                    if(ch instanceof zlUIEdit) {
                        list.push(ch);
                    }
                }
            }
        }
        if(!list.length)
            return;
        let i=list.indexOf(current)+1;
        if(i>=list.length) {i=0;}
        //console.log("NextEdit:"+i, list);
        list[i].OnNotify();
    }

    GetTrack(name:string):zlTrackGroup
    {
        return this.track.track[name];
    }
    PlayTrack(name:string, loop:number)
    {
        this.track.Play(name,loop);
    }
    StopTrack(name:string)
    {
        this.track.track[name].Stop();
    }
    get DefaultComboMenu():zlUISlider
    {
        if(!this.default_combo_menu) {
            this.default_combo_menu=new zlUISlider(this);
        }
        return this.default_combo_menu;        
    }
    get DefaultComboItem():zlUIButton
    {
        if(!this.default_combo_item) {
            this.default_combo_item=new zlUIButton(this);
        }
        return this.default_combo_item;
    }
    get LastClipRect():Vec4
    {
        if(this.clip_stack.length>0) {
            return this.clip_stack[this.clip_stack.length-1];
        }
        return undefined;
    }

    path:string;
    include:string[];
    image_pack:string[];

    texture:zlTexturePack;
    fonts:ImGui.Font[]=[];
    notify:zlUIWin;
    hover:zlUIWin;
    drag:zlUIWin;
    drag_x:number;
    drag_y:number;
    first_pos_x:number;
    first_pos_y:number;

    popup:zlUIWin;

    hover_slider:zlUIWin;
    slider:zlUIWin;

    default_w:number;
    default_h:number;

    default_combo_menu:zlUISlider;
    default_combo_item:zlUIButton;

    prevDown:boolean=false;
    any_pointer_down:boolean=false;
    mouse_pos:ImGui.ImVec2;
    mouse_wheel:number=0;
    mouse_wheel_speed:number=20;
    touch_tolerance:number=50;

    default_panel_color:number=0xffebebeb;
    dom_input:Input;
    nextEdit:zlUIEdit;

    track:zlTrackMgr;

    clip_stack:Vec4[]=[]

    refresh_count:number=0;
    calrect_count:number=0;
    paint_count:number=0;
}
