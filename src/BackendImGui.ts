import { FetchImage, ImGui, ImGui_Impl, LoadImage } from "@zhobo63/imgui-ts";
import { Board, ECornerFlags, IBackend, IFont, IPaint, ITexture, IVec2, MultiplyAlpha, Rect, SetFLT_MAX, Transform, UIImage, UIPanel, UIWin, UpdateTexturePack, Use_Transform, Vec2, Vec4, zlUIButton, zlUICheck, zlUICombo, zlUIEdit, zlUIImage, zlUIImageText, zlUIPanel, zlUIParticle, zlUISlider, zlUITree, zlUITreeNode, zlUITreeNodeOpen, zlUIWin } from "./zlUI";
import { ImDrawList } from "@zhobo63/imgui-ts/src/imgui";

let vec_a=new ImGui.Vec2;
let vec_b=new ImGui.Vec2;
let vec_c=new ImGui.Vec2;
let vec_d=new ImGui.Vec2;
let vec4_a=new ImGui.Vec4;
let mat2_a=new ImGui.Transform;

function toImDrawCornerFlags(f:ECornerFlags):ImGui.ImDrawCornerFlags
{
    let n=f as number;
    return n as ImGui.ImDrawCornerFlags;
}

function toImVec2(to:ImGui.Vec2, v:Vec2):ImGui.Vec2
{
    to.Set(v.x, v.y);
    return to;
}
function toImVec4(to:ImGui.Vec4, v:Vec4):ImGui.Vec4
{
    to.Set(v.x, v.y, v.z, v.w);
    return to;
}

function toImTransform(to:ImGui.Transform, m:Transform):ImGui.Transform
{
    to.rotate.Set(
        m.rotate.m11,
        m.rotate.m12,
        m.rotate.m21,
        m.rotate.m22
    )
    to.translate.Set(m.translate.x, m.translate.y);
    to.scale=m.scale;
    return to;
}

export function RenderCheckMark(drawlist:ImDrawList,x:number,y:number,col:number,sz:number)
{
    let thickness = Math.max(sz / 5.0, 1.0);
    sz -= thickness * 0.5;
    let px=x+thickness*0.25;
    let py=y+thickness*0.25;
    let third = sz / 3.0;
    let bx = px + third;
    let by = py + sz - third * 0.5;
    vec_a.Set(bx - third, by - third);
    drawlist.PathLineTo(vec_a);
    vec_a.Set(bx,by);
    drawlist.PathLineTo(vec_a);
    vec_a.Set(bx + third * 2.0, by - third * 2.0)
    drawlist.PathLineTo(vec_a);
    drawlist.PathStroke(col, false, thickness);
}
export function RenderArrow(drawlist:ImDrawList, pos:Vec2, color:number,dir:ImGui.ImGuiDir, size:number, scale:number)
{
    let r = size * 0.40 * scale;
    let cx=pos.x+size*0.5;
    let cy=pos.y+size*0.5*scale;
    let x1,y1,x2,y2,x3,y3;
    switch (dir)
    {
    case ImGui.ImGuiDir.Up:
    case ImGui.ImGuiDir.Down:
        if (dir == ImGui.ImGuiDir.Up) r = -r;
        x1=0; y1=0.75;
        x2=-0.866; y2=-0.750;
        x3=+0.866; y3=-0.750;
        break;
    case ImGui.ImGuiDir.Left:
    case ImGui.ImGuiDir.Right:
        if (dir == ImGui.ImGuiDir.Left) r = -r;
        x1=+0.750; y1=+0.000;
        x2=-0.750; y2=+0.866;
        x3=-0.750; y3=-0.866;
        break;
    default:
        return;
    }
    vec_a.Set(cx+x1*r, cy+y1*r);
    vec_b.Set(cx+x2*r, cy+y2*r);
    vec_c.Set(cx+x3*r, cy+y3*r);
    drawlist.AddTriangleFilled(vec_a, vec_b, vec_c, color);
}

class ImFont implements IFont
{
    constructor()
    {

    }

    AddFontRange(start:number, end:number) {
        this.font.AddFontRange(start, end);
    }
    MergeFont(font:IFont) {
        this.font.MergeFont((font as ImFont).font);
    }
    CalTextSize(size: number, max_width: number, wrap_width: number, text_begin: string,
        text_end: number | null,
        isready:boolean[]) :IVec2
    {
        let isReady:ImGui.ImScalar<boolean>=[false];
        let fz=this.font.CalcTextSizeA(size, max_width, wrap_width, text_begin, text_end, null, isReady);
        if(isready) {
            isready[0]=isReady[0];
        }
        return {
            x:fz.x,
            y:fz.y
        };
    }    

    name:string;
    style:string;
    size:number;
    font:ImGui.Font;
}

export class PaintWin implements IPaint
{
    constructor(backend:BackendImGui)
    {
        this.backend=backend;
    }

    Paint()
    {
    }

    get drawlist() {
        return this.backend.drawlist;
    }

    backend:BackendImGui;
    obj:zlUIWin;
}

export class PaintImage extends PaintWin
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    Paint()
    {
        let obj:zlUIImage=this.obj as zlUIImage;
        let drawlist=this.drawlist;
        if(Use_Transform) {
            let vstart=drawlist.GetVertexSize();
            this.PaintImage();
            drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
        }else {
            this.PaintImage();
        }        
    }

    PaintImage() 
    {
        let obj:zlUIImage=this.obj as zlUIImage;
        if(obj.image)  {            
            let im=obj.image;
            if(im.texture._texture) {
                this.drawlist.AddImageRounded(
                    im.texture._texture, 
                    toImVec2(vec_a, obj._localRect.xy), 
                    toImVec2(vec_b, obj._localRect.max),
                    toImVec2(vec_c, im.uv1), 
                    toImVec2(vec_d,im.uv2),
                    MultiplyAlpha(obj.color, obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }
        }        
    }
}

export class PaintPanel extends PaintImage
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    PaintBoard(board:Board)
    {
        if(!board.image.texture._texture)
            return;
        if(!board.image.uv1)    {
            board.image=UpdateTexturePack(board.image);
        }
        let obj=this.obj as zlUIPanel;
        if(!board.vert)   {
            const iw=board.image.x2-board.image.x1;
            const ih=board.image.y2-board.image.y1;
            const x1=obj._localRect.xy.x;
            const x2=x1+board.x1;
            const x3=obj._localRect.max.x-(iw-board.x2);
            const x4=obj._localRect.max.x;
            const y1=obj._localRect.xy.y;
            const y2=y1+board.y1;
            const y3=obj._localRect.max.y-(ih-board.y2);
            const y4=obj._localRect.max.y;

            board.vert=[];
            board.vert.push(new Vec2(x1, y1));
            board.vert.push(new Vec2(x2, y1));
            board.vert.push(new Vec2(x3, y1));
            board.vert.push(new Vec2(x4, y1));
            board.vert.push(new Vec2(x1, y2));
            board.vert.push(new Vec2(x2, y2));
            board.vert.push(new Vec2(x3, y2));
            board.vert.push(new Vec2(x4, y2));
            board.vert.push(new Vec2(x1, y3));
            board.vert.push(new Vec2(x2, y3));
            board.vert.push(new Vec2(x3, y3));
            board.vert.push(new Vec2(x4, y3));
            board.vert.push(new Vec2(x1, y4));
            board.vert.push(new Vec2(x2, y4));
            board.vert.push(new Vec2(x3, y4));
            board.vert.push(new Vec2(x4, y4));

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
            board.uv.push(new Vec2(u1, v1));
            board.uv.push(new Vec2(u2, v1));
            board.uv.push(new Vec2(u3, v1));
            board.uv.push(new Vec2(u4, v1));
            board.uv.push(new Vec2(u1, v2));
            board.uv.push(new Vec2(u2, v2));
            board.uv.push(new Vec2(u3, v2));
            board.uv.push(new Vec2(u4, v2));
            board.uv.push(new Vec2(u1, v3));
            board.uv.push(new Vec2(u2, v3));
            board.uv.push(new Vec2(u3, v3));
            board.uv.push(new Vec2(u4, v3));
            board.uv.push(new Vec2(u1, v4));
            board.uv.push(new Vec2(u2, v4));
            board.uv.push(new Vec2(u3, v4));
            board.uv.push(new Vec2(u4, v4));
        }
        let col=MultiplyAlpha(board.color, obj.alpha);
        let drawlist=this.drawlist;

        for(let i=0;i<3;i++)    {
            if(board.visible[i])    {
                drawlist.AddImage(board.image.texture._texture,
                    toImVec2(vec_a, board.vert[i]), 
                    toImVec2(vec_b, board.vert[i+5]), 
                    toImVec2(vec_c, board.uv[i]),
                    toImVec2(vec_d, board.uv[i+5]), col);
            }
            if(board.visible[i+3])    {
                drawlist.AddImage(board.image.texture._texture,
                    toImVec2(vec_a, board.vert[i+4]),
                    toImVec2(vec_b, board.vert[i+9]), 
                    toImVec2(vec_c, board.uv[i+4]), 
                    toImVec2(vec_d, board.uv[i+9]), col);
            }
            if(board.visible[i+6])    {
                drawlist.AddImage(board.image.texture._texture,
                    toImVec2(vec_a, board.vert[i+8]), 
                    toImVec2(vec_b, board.vert[i+13]), 
                    toImVec2(vec_c, board.uv[i+8]), 
                    toImVec2(vec_d, board.uv[i+13]), col);
            }
        }
    }

    PaintClient()
    {
        let obj=this.obj as zlUIPanel;
        if(obj.isDrawClient)   {
            let drawlist=this.drawlist;
            if(obj.color4) {
                drawlist.AddRectFilledMultiColorRound(
                    toImVec2(vec_a, obj._localRect.xy), 
                    toImVec2(vec_b, obj._localRect.max), 
                    MultiplyAlpha(obj.color4[0],obj.alpha), 
                    MultiplyAlpha(obj.color4[1],obj.alpha), 
                    MultiplyAlpha(obj.color4[2],obj.alpha), 
                    MultiplyAlpha(obj.color4[3],obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }else {
                drawlist.AddRectFilled(
                    toImVec2(vec_a, obj._localRect.xy),
                    toImVec2(vec_b, obj._localRect.max), 
                    MultiplyAlpha(obj.color, obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }
        }        
    }

    PaintText():void 
    {
        let obj=this.obj as zlUIPanel;
        if(obj.text && obj._textPos)   {
            let textPos=toImVec2(vec_a, obj._textPos);
            let wrap_width=obj.w-obj.padding-obj.padding;
            let text=(typeof obj.text === "string") ? obj.text:""+obj.text;
            if(obj._textRemaining>0) {
                text=text.substring(0,obj._textRemaining)+"…";
            }

            let font=obj._owner.GetFont(obj.fontIndex);
            let wrap=obj.isMultiline?wrap_width:0;
            let color=obj.textColor;
            if(obj.textColorHover && obj._owner.hover==obj) {
                color=obj.textColorHover;
            }
            color=MultiplyAlpha(color, obj.alpha);
            if(color===undefined) {
                console.log(obj.Name);
            }
            let imfont=(font as ImFont).font;
            let drawlist=this.drawlist;
            let textClip=toImVec4(vec4_a, obj._textClip);
            if(Use_Transform) {
                imfont.RenderText(drawlist, font.size, textPos, 
                    color,
                    textClip, text, text.length, wrap, true);    
            }else {
                drawlist.AddText(imfont, font.size,
                    textPos, color, text, text.length, wrap,
                    textClip);
            }
        }
    }

    PaintPanel():void 
    {
        let obj=this.obj as zlUIPanel;
        this.PaintImage();
        this.PaintClient();
        if(obj.drawBoard)  {
            obj.drawBoard.color=obj.color;
            this.PaintBoard(obj.drawBoard);
        }
        let drawlist=this.drawlist;
        if(obj.isDrawHover && obj._owner.hover==obj) {
            if(obj.colorHover4) {
                drawlist.AddRectFilledMultiColorRound(
                    toImVec2(vec_a, obj._localRect.xy), 
                    toImVec2(vec_b, obj._localRect.max), 
                    MultiplyAlpha(obj.colorHover4[0], obj.alpha),
                    MultiplyAlpha(obj.colorHover4[1], obj.alpha),
                    MultiplyAlpha(obj.colorHover4[2], obj.alpha),
                    MultiplyAlpha(obj.colorHover4[3], obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner))
            }else {
                drawlist.AddRectFilled(
                    toImVec2(vec_a, obj._localRect.xy),
                    toImVec2(vec_b, obj._localRect.max),
                    MultiplyAlpha(obj.colorHover, obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }
        }
        if(obj.isDrawBorder)   {
            drawlist.AddRect(
                toImVec2(vec_a, obj._localRect.xy),
                toImVec2(vec_b, obj._localRect.max), 
                MultiplyAlpha(obj.borderColor, obj.alpha),
                obj.rounding, toImDrawCornerFlags(obj.roundingCorner),
                obj.borderWidth);
        }
        this.PaintText();
    }

    Paint()
    {
        if(Use_Transform) {
            let obj=this.obj as zlUIPanel;
            if(obj._world) {
                let drawlist=this.drawlist;
                let vstart=drawlist.GetVertexSize();    
                this.PaintPanel();
                drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
            }
        }else {
            this.PaintPanel();
        }
    }
}

export class PaintEdit extends PaintPanel
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }
    
    PaintText():void 
    {
        let obj=this.obj as zlUIEdit;
        if(obj.text)   {
            let text=(typeof obj.text === "string") ? obj.text:""+obj.text;
            let font=obj._owner.GetFont(obj.fontIndex);
            if(obj.isPassword) {
                if(!obj.passwordText || obj.text.length!=obj.passwordText.length)  {
                    obj.passwordText=obj.text;
                    obj.passwordText=obj.passwordText.replace(/./g, obj.password_char)
                }
                text=obj.passwordText;
            }else {
            }
            let wrap=obj.isMultiline?obj.w:0;
            let color=obj.textColor;
            if(obj.textColorHover && obj._owner.hover==obj) {
                color=obj.textColorHover;
            }
            color=MultiplyAlpha(color, obj.alpha);
            let imfont=(font as ImFont).font;
            let drawlist=this.drawlist;
            let textClip=toImVec4(vec4_a, obj._textClip);
            let textPos=toImVec2(vec_a, obj._textPos);
            if(Use_Transform) {
                imfont.RenderText(drawlist, font.size, textPos, color,
                    textClip, text, text.length, wrap, true);    
            }else {
                drawlist.AddText(imfont, font.size, textPos, color, text, text.length, wrap, textClip);
            }
        }
    }

}
export class PaintButton extends PaintPanel
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    PaintClient(): void {
        let obj=this.obj as zlUIButton;
        if(obj.isDrawClient)   {
            let color:number=obj.color;
            let color4:number[]=obj.color4;
            let drawlist=this.drawlist;
            if(color4) {
                drawlist.AddRectFilledMultiColorRound(
                    toImVec2(vec_a, obj._localRect.xy),
                    toImVec2(vec_b, obj._localRect.max), 
                    MultiplyAlpha(color4[0], obj.alpha), 
                    MultiplyAlpha(color4[1], obj.alpha), 
                    MultiplyAlpha(color4[2], obj.alpha), 
                    MultiplyAlpha(color4[3], obj.alpha), 
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }else {
                drawlist.AddRectFilled(
                    toImVec2(vec_a, obj._localRect.xy),
                    toImVec2(vec_b, obj._localRect.max),
                    MultiplyAlpha(color, obj.alpha),
                    obj.rounding, toImDrawCornerFlags(obj.roundingCorner));
            }
        }
    }
}

export class PaintCheck extends PaintButton
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    PaintCheck():void
    {
        let obj=this.obj as zlUICheck;
        let drawlist=this.drawlist;
        drawlist.AddRect(
            toImVec2(vec_a, obj.checkmark_xy),
            toImVec2(vec_b, obj.checkmark_max),
            MultiplyAlpha(obj.borderColor, obj.alpha), 
            obj.rounding, ImGui.ImDrawCornerFlags.All, 1);
        if(obj.isChecked) {
            let x=obj.checkmark_xy.x+2;
            let y=obj.checkmark_xy.y+2;
            RenderCheckMark(drawlist, x,y,
                MultiplyAlpha(obj.textColor, obj.alpha), 16);
        }
    }
    Paint():void 
    {
        super.Paint();
        let obj=this.obj as zlUICheck;
        if(obj.isDrawCheck)    {
            let drawlist=this.drawlist;
            let vstart=(Use_Transform)?drawlist.GetVertexSize():0;
            this.PaintCheck();
            if(Use_Transform) {
                drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
            }
        }
    }

}

export class PaintCombo extends PaintButton
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    Paint(): void 
    {
        super.Paint();
        let obj=this.obj as zlUICombo;
        if(obj.isDrawCombo) {
            let drawlist=this.drawlist;
            let vstart=(Use_Transform)?drawlist.GetVertexSize():0;
            RenderArrow(drawlist, obj.arrow_xy, 
                MultiplyAlpha(obj.textColor, obj.alpha), ImGui.ImGuiDir.Down, 16, 1);
            if(Use_Transform) {
                drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
            }
        }
    }
}

export class PaintSlider extends PaintPanel
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    Paint():void 
    {
        super.Paint();
        let obj=this.obj as zlUISlider;
        let drawBar=false;
        if(obj._owner.slider)  {
            drawBar=obj._owner.slider==obj;
        }else {
            drawBar=obj._owner.hover_slider==obj;
        }
        if(drawBar) {
            let drawlist=this.drawlist;
            let vstart=(Use_Transform)?drawlist.GetVertexSize():0;
            let scroll=obj.GetScrollType();
            let barxy:Vec2;
            let barxy2:Vec2;
            if(scroll.isScrollH)  {
                barxy=obj._scrollHxy;
                barxy2=obj._scrollHxy2;
            }
            if(scroll.isScrollW)  {
                barxy=obj._scrollWxy;
                barxy2=obj._scrollWxy2;
            }
            if(obj._is_scrollbar_hover) {
                if(obj.scrollbarColorHover4) {
                    drawlist.AddRectFilledMultiColorRound(
                        toImVec2(vec_a, barxy),
                        toImVec2(vec_b, barxy2), 
                        MultiplyAlpha(obj.scrollbarColorHover4[0],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColorHover4[1],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColorHover4[2],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColorHover4[3],obj.alpha),
                        4, ImGui.ImDrawCornerFlags.All);
                }else {
                    drawlist.AddRectFilled(
                        toImVec2(vec_a, barxy),
                        toImVec2(vec_b, barxy2), 
                        MultiplyAlpha(obj.scrollbarColorHover, obj.alpha), 4);
                }
            }else {
                if(obj.scrollbarColor4) {
                    drawlist.AddRectFilledMultiColorRound(
                        toImVec2(vec_a, barxy),
                        toImVec2(vec_b, barxy2), 
                        MultiplyAlpha(obj.scrollbarColor4[0],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColor4[1],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColor4[2],obj.alpha), 
                        MultiplyAlpha(obj.scrollbarColor4[3],obj.alpha),
                        4, ImGui.ImDrawCornerFlags.All);
                }else {
                    drawlist.AddRectFilled(
                        toImVec2(vec_a, barxy),
                        toImVec2(vec_b, barxy2), 
                        MultiplyAlpha(obj.scrollbarColor, obj.alpha), 4);
                }
            }
            if(Use_Transform) {
                drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
            }
        }
    }
}

export class PaintImageText extends PaintWin
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    PaintImageText():void 
    {
        let obj=this.obj as zlUIImageText;
        let drawlist=this.drawlist;
        let col=MultiplyAlpha(obj.color, obj.alpha);
        for(let image of obj.imageText)
        {
            let imgFont=image.imageFont;
            let tex=imgFont.texure;            
            drawlist.AddImage(tex.texture._texture,
                toImVec2(vec_a, image.screenXY),
                toImVec2(vec_b, image.screenMax), 
                toImVec2(vec_c, imgFont.uv1),
                toImVec2(vec_d, imgFont.uv2), col);
        }
    }
    Paint():void 
    {
        if(Use_Transform) {
            let obj=this.obj;
            if(obj._world) {
                let drawlist=this.drawlist;
                const vstart=drawlist.GetVertexSize();
                this.PaintImageText();
                drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
            }
        }else {
            this.PaintImageText();
        }
        super.Paint();
    }
}

export class PaintTreeNodeOpen extends PaintCheck
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    PaintCheck():void
    {
        let drawlist=this.drawlist;
        let obj=this.obj as zlUICheck;
        let col=MultiplyAlpha(obj.textColor, obj.alpha);
        let pos=obj._localRect.xy;

        if(obj.isChecked) {
            RenderArrow(drawlist, pos, col, ImGui.ImGuiDir.Down, obj.w ,0.8);
        }else {
            RenderArrow(drawlist, pos, col, ImGui.ImGuiDir.Right, obj.h ,0.8);
        }
    }    
}

export class PaintParticle extends PaintWin
{
    constructor(backend:BackendImGui)
    {
        super(backend);
    }

    Paint()
    {
        let obj:zlUIParticle=this.obj as zlUIParticle;
        let drawlist=this.drawlist;
        if(Use_Transform) {
            let vstart=drawlist.GetVertexSize();
            this.PaintParticle();
            drawlist.Transform(toImTransform(mat2_a, obj._world), vstart);
        }else {
            this.PaintParticle();
        }        
    }

    PaintParticle()
    {
        let obj:zlUIParticle=this.obj as zlUIParticle;
        let drawlist=this.drawlist;
        this.blend.src=obj.blend.src;
        this.blend.dst=obj.blend.dst;
        drawlist.SetBlend(this.blend);
        
        let xy=obj._localRect.xy;
        for(let pt of obj.particle) {
            if(pt.life<0)
                continue;
            let hsize=pt.size*0.5;
            let px=pt.pos.x+xy.x;
            let py=pt.pos.y+xy.y;
            vec_a.Set(px-hsize, py-hsize);
            vec_b.Set(px+hsize, py+hsize);
            let col=MultiplyAlpha(pt.color.toColorHex(), obj.alpha);
            if(obj.image) {
                drawlist.AddImage(obj.image.texture._texture,
                    vec_a,vec_b,
                    toImVec2(vec_c, obj.image.uv1),
                    toImVec2(vec_d, obj.image.uv2), col
                )            
            }else {
                drawlist.AddRectFilled(
                    vec_a, vec_b, col
                )
            }
        }
        drawlist.SetBlend(ImGui.Blend.ALPHA);
    }

    blend:ImGui.Blend=new ImGui.Blend;
}

export class BackendImGui implements IBackend
{
    constructor(drawlist:ImDrawList)
    {
        this.has_astc=ImGui_Impl.gl.getExtension("WEBGL_compressed_texture_astc")?true:false;
        this.drawlist=drawlist;
        SetFLT_MAX(ImGui.FLT_MAX);

        this.paint={};
        this.paint[zlUIWin.CSID]=new PaintWin(this);
        this.paint[zlUIImage.CSID]=new PaintImage(this);
        this.paint[zlUIPanel.CSID]=new PaintPanel(this);
        this.paint[zlUIEdit.CSID]=new PaintEdit(this);
        this.paint[zlUIButton.CSID]=new PaintButton(this);
        this.paint[zlUICheck.CSID]=new PaintCheck(this);
        this.paint[zlUICombo.CSID]=new PaintCombo(this);
        this.paint[zlUISlider.CSID]=new PaintSlider(this);
        this.paint[zlUITreeNode.CSID]=new PaintCheck(this);
        this.paint[zlUITree.CSID]=new PaintSlider(this);
        this.paint[zlUIImageText.CSID]=new PaintImageText(this);
        this.paint[zlUITreeNodeOpen.CSID]=new PaintTreeNodeOpen(this);
        this.paint[zlUIParticle.CSID]=new PaintParticle(this);
    }

    async CreateTexture(url:string):Promise<ITexture>
    {
        let filepart=url.split(".");
        let ext=filepart[1];
        if(this.has_astc && this.enable_astc) {
            ext="astc";
            url=`${filepart[0]}.astc`;
        }
        let tex=new ImGui_Impl.Texture;
        switch(ext) {
        case "jpg":
        case "png":
        case "webp":
            {
                let image=new Image;
                let proc=LoadImage(image).then(r=>{
                    tex.Update(image);
                })
                image.crossOrigin="anonymous";
                image.src=url;
                await proc;
            }
            break;
        case "dds":
        case "astc":
            await FetchImage(url, (buf)=>{
                tex.Update(buf);
            })
            break;
        }
        console.log("LoadImage", url, tex);
        return tex;
    }

    CreateFont(name: string, size: number, style: string):IFont
    {
        let font:ImFont=new ImFont;
        font.name=name;
        font.style=style;
        font.size=size;
        font.font=ImGui.CreateFont(name, size, style);
        return font;
    }
    DefaultFont():IFont
    {
        if(!this.font) {
            let font=new ImFont;        
            let imfont=ImGui.GetFont();
            font.font=imfont;
            font.name=imfont.FontName;
            font.size=imfont.FontSize;
            font.style=imfont.FontStyle;
            this.font=font;    
        }
        return this.font;
    }
    PushClipRect(rect:Rect) {
        this.drawlist.PushClipRect(
            toImVec2(vec_a, rect.xy),
            toImVec2(vec_b, rect.max)
        );
    }
    PopClipRect() {
        this.drawlist.PopClipRect();
    }

    Paint(obj:zlUIWin)
    {
        let paint=this.paint[obj._csid];
        if(!paint) {
            console.error("BackendImGui::Paint", obj._csid);
        }
        paint.obj=obj;
        paint.Paint();
        paint.obj=null;
    }

    paint:{[key:string]:IPaint};
    
    has_astc:boolean;
    enable_astc:boolean=false;

    font:ImFont;
    drawlist:ImGui.ImDrawList;
}

export const ImColor_Gray: ImGui.ImVec4 = new ImGui.ImVec4(0.5, 0.5, 0.5, 1)

export function InspectorObj(obj:any, id:number):number
{
    ImGui.PushID(id);
    for (let key in obj) {
        let value = obj[key];
        if(value === undefined) {
            ImGui.Text(key + ": (undefined)");
        }
        else if (value === null) {
            ImGui.Text(key + ": (null)");
        }
        else if (key.indexOf("color") >= 0 || key.indexOf("Color") >= 0) {            
            let c = new ImGui.Color(value);
            if (ImGui.ColorEdit4(key, c.Value)) {
                obj[key]=c.toImU32();
            }
        }
        else if (typeof (value) === 'object') {
            if (ImGui.TreeNode(key)) {
                id = InspectorObj(value, id + 1);
                ImGui.TreePop();
            }
        }
        else if (typeof (value) === 'number') {
            let v = (_: number = value as number): number => obj[key] = _;
            ImGui.InputFloat(key, v);
        }
        else if (typeof (value) === 'boolean') {
            let v = (_: boolean = value as boolean): boolean => obj[key] = _;
            ImGui.Checkbox(key, v);
        }
        else {
            ImGui.Text(key + ": " + value);
        }
    }
    ImGui.PopID();
    return id;
}

export function InspectorUI(obj:zlUIWin, id:number):number
{
    if (ImGui.TreeNode("Param")) {
        ImGui.Indent();
        id = InspectorObj(obj as any, id + 1);
        ImGui.Unindent();
        ImGui.TreePop();
    }
    if(obj.pChild && obj.pChild.length>0) {
        for(let ch of obj.pChild) {
            let pushColor=false;
            ImGui.PushID(id);
            id++;
            if(!ch.isVisible) {
                ImGui.PushStyleColor(ImGui.ImGuiCol.Text, ImColor_Gray);
                pushColor=true;
            }
            if (ImGui.TreeNodeEx(ch._csid + " " + ch.Name)) {
                id = InspectorUI(ch, id + 1);
                ImGui.TreePop();
            }
            if(pushColor) {
                ImGui.PopStyleColor();
            }
            ImGui.PopID();
        }
    }
    return id;
}
