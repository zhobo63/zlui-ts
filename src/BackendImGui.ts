import { FetchImage, ImGui, ImGui_Impl, LoadImage } from "@zhobo63/imgui-ts";
import { Board, BoardType, Clone, ECornerFlags, EParticleShape, IBackend, IFont, IPaint, ITexture, IVec2, MultiplyAlpha, Rect, SetFLT_MAX, TexturePack, Transform, UIImage, UIMgr, UIPanel, UIWin, UpdateTexturePack, Use_Transform, Vec2, Vec4, zlUIButton, zlUICheck, zlUICombo, zlUIEdit, zlUIImage, zlUIImageText, zlUIMgr, zlUIPanel, zlUIParticle, zlUISlider, zlUITree, zlUITreeNode, zlUITreeNodeOpen, zlUIWin, zlUILabelEdit } from "./zlUI";
import { ImDrawList } from "@zhobo63/imgui-ts/src/imgui";

export let vec_a=new ImGui.Vec2;
export let vec_b=new ImGui.Vec2;
export let vec_c=new ImGui.Vec2;
export let vec_d=new ImGui.Vec2;
export let vec_1=new ImGui.Vec2;
export let vec_2=new ImGui.Vec2;
export let vec_3=new ImGui.Vec2;
export let vec_4=new ImGui.Vec2;

export let vec4_a=new ImGui.Vec4;
export let mat2_a=new ImGui.Transform;

export function toImDrawCornerFlags(f:ECornerFlags):ImGui.ImDrawCornerFlags
{
    let n=f as number;
    return n as ImGui.ImDrawCornerFlags;
}

export function toImVec2(to:ImGui.Vec2, v:Vec2):ImGui.Vec2
{
    to.Set(v.x, v.y);
    return to;
}
export function toImVec4(to:ImGui.Vec4, v:Vec4):ImGui.Vec4
{
    to.Set(v.x, v.y, v.z, v.w);
    return to;
}

export function toImTransform(to:ImGui.Transform, m:Transform):ImGui.Transform
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

export function RenderImage(drawlist:ImDrawList, image: TexturePack, 
    r:Rect, col:number, rounding:number, corner:ECornerFlags)
{
    drawlist.AddImageRounded(
        image.texture._texture, 
        toImVec2(vec_a, r.xy), 
        toImVec2(vec_b, r.max),
        toImVec2(vec_c, image.uv1), 
        toImVec2(vec_d, image.uv2),
        col,
        rounding, toImDrawCornerFlags(corner));
}

export function RenderBoard(drawlist:ImDrawList, board:Board, r:Rect, col:number)
{
    if(!board.vert)   {
        const iw=board.image.x2-board.image.x1;
        const ih=board.image.y2-board.image.y1;
        const x1=r.xy.x;
        const x2=x1+board.x1;
        const x3=r.max.x-(iw-board.x2);
        const x4=r.max.x;
        const y1=r.xy.y;
        const y2=y1+board.y1;
        const y3=r.max.y-(ih-board.y2);
        const y4=r.max.y;

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

export function RenderClient(drawlist:ImDrawList, xy:Vec2, xy2:Vec2, 
    col4:number[], col:number, alpha:number,
    rounding:number, corner:ECornerFlags)
{
    if(col4) {
        drawlist.AddRectFilledMultiColorRound(
            toImVec2(vec_a, xy), 
            toImVec2(vec_b, xy2), 
            MultiplyAlpha(col4[0],alpha), 
            MultiplyAlpha(col4[1],alpha), 
            MultiplyAlpha(col4[2],alpha), 
            MultiplyAlpha(col4[3],alpha), 
            rounding, toImDrawCornerFlags(corner));
    }else {
        drawlist.AddRectFilled(
            toImVec2(vec_a, xy),
            toImVec2(vec_b, xy2), 
            MultiplyAlpha(col,alpha), 
            rounding, toImDrawCornerFlags(corner));
    }
}

export function RenderCheck(drawlist:ImDrawList, xy:Vec2, max:Vec2, 
    borderColor:number, textColor:number, alpha:number, rounding:number, checked:boolean)
{
    drawlist.AddRect(
        toImVec2(vec_a, xy),
        toImVec2(vec_b, max),
        MultiplyAlpha(borderColor, alpha), 
        rounding, ImGui.ImDrawCornerFlags.All, 1);
    if(checked) {
        let x=xy.x+2;
        let y=xy.y+2;
        RenderCheckMark(drawlist, x,y,
            MultiplyAlpha(textColor, alpha), 16);
    }
}

export function RenderText(drawlist:ImDrawList, font:IFont, text:string,
    pos:Vec2, wrap_width:number, color:number, clip:Vec4)
{
    let textPos=toImVec2(vec_a, pos);
    let imfont=(font as ImFont).font;
    let textClip=toImVec4(vec4_a, clip);
    if(Use_Transform) {
        imfont.RenderText(drawlist, font.size, textPos, 
            color,
            textClip, text, text.length, wrap_width, true);    
    }else {
        drawlist.AddText(imfont, font.size,
            textPos, color, text, text.length, wrap_width,
            textClip);
    }
}

export function RenderBorder(drawlist:ImDrawList, xy:Vec2, xy2:Vec2, 
    col:number, alpha:number,
    rounding:number, corner:ECornerFlags, borderWidth:number)
{
    drawlist.AddRect(
        toImVec2(vec_a, xy),
        toImVec2(vec_b, xy2), 
        MultiplyAlpha(col, alpha),
        rounding, toImDrawCornerFlags(corner),
        borderWidth);
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
    CSS():string {
        return `${this.style} ${this.size}px ${this.name}`;
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
        let obj=this.obj;
        if(this.obj._owner.notify==this.obj) {
            if(this.backend.is_move && obj.on_mousemove) {
                let pt=obj.ToLocal(obj._owner.mouse_pos);
                obj.on_mousemove(pt.x, pt.y);
            }
            if(this.backend.is_down && obj.on_mousedown) {
                let pt=obj.ToLocal(obj._owner.mouse_pos);
                obj.on_mousedown(pt.x, pt.y);
            }
            if(this.backend.is_up && obj.on_mouseup) {
                let pt=obj.ToLocal(obj._owner.mouse_pos);
                obj.on_mouseup(pt.x, pt.y);
            }
        }
    }
    PaintEnd() 
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
        if(obj.image && obj.image.texture._texture)  {            
            RenderImage(this.drawlist, obj.image, obj._localRect, 
                MultiplyAlpha(obj.color, obj.alpha), obj.rounding, obj.roundingCorner);
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
        switch(board.type) {
        case BoardType.NineGrid:
            RenderBoard(this.drawlist, board, obj._localRect, MultiplyAlpha(board.color, obj.alpha));
            break;
        case BoardType.Image:
            RenderImage(this.drawlist, board.image, obj._localRect, MultiplyAlpha(board.color, obj.alpha), obj.rounding, obj.roundingCorner);
            break;
        }
    }

    PaintClient()
    {
        let obj=this.obj as zlUIPanel;
        if(obj.isDrawClient)   {
            RenderClient(this.drawlist, obj._localRect.xy, obj._localRect.max,
                obj.color4, obj.color, obj.alpha, 
                obj.rounding, obj.roundingCorner);
        }        
    }

    PaintText():void 
    {
        let obj=this.obj as zlUIPanel;
        if(obj.text && obj._textPos)   {
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
            RenderText(this.drawlist, font, text, obj._textPos, wrap, color, obj._textClip);
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
            RenderClient(drawlist, obj._localRect.xy, obj._localRect.max,
                obj.colorHover4, obj.colorHover, obj.alpha,
                obj.rounding, obj.roundingCorner);
        }
        if(obj.isDrawBorder)   {
            RenderBorder(drawlist, obj._localRect.xy, obj._localRect.max,
                obj.borderColor, obj.alpha,
                obj.rounding, obj.roundingCorner, obj.borderWidth);
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
    
    PaintClient()
    {
        let obj=this.obj as zlUIEdit;
        if(obj.isDrawClient)   {
            RenderClient(this.drawlist, obj._localRect.xy, obj._localRect.max,
                obj.color4, obj.color, obj.alpha, 
                obj.rounding, obj.roundingCorner);
        }        
        if(obj.type=='range' && obj.range) {
            let lr=obj._localRect;
            let range=obj.range;
            let per=(obj.value-range.min_value)/(range.max_value-range.min_value);
            range.rect.xy.x=lr.x;
            range.rect.xy.y= lr.y;
            range.rect.max.x=lr.x+lr.Width()*per;
            range.rect.max.y=lr.w;

            RenderClient(this.drawlist, range.rect.xy, range.rect.max,
                undefined, obj.textColor, obj.alpha, 
                obj.rounding, obj.roundingCorner);
        }
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
            RenderText(this.drawlist, font, text, obj._textPos, wrap, color, obj._textClip);
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
            RenderClient(this.drawlist, obj._localRect.xy, obj._localRect.max,
                obj.color4, obj.color, obj.alpha, 
                obj.rounding, obj.roundingCorner);
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
        RenderCheck(this.drawlist, obj.checkmark_xy, obj.checkmark_max, 
            obj.borderColor, obj.textColor, obj.alpha, obj.rounding, obj.isChecked);
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
                RenderClient(drawlist, barxy, barxy2, obj.scrollbarColorHover4, obj.scrollbarColorHover, obj.alpha, 4, ECornerFlags.All);
            }else {
                RenderClient(drawlist, barxy, barxy2, obj.scrollbarColor4, obj.scrollbarColor, obj.alpha, 4, ECornerFlags.All);
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
            let col=MultiplyAlpha(pt.color.toColorHex(), obj.alpha);

            if(obj.controller.shape==EParticleShape.eQuad) {
                let len=pt.vec.Legnth();
                if(len > Math.max(pt.size, 1)) {
                    let inv=1/len;
                    let nvec_x=pt.vec.x*inv;
                    let nvec_y=pt.vec.y*inv;                    
                    let p2_x=pt.pos.x+pt.vec.x;
                    let p2_y=pt.pos.y+pt.vec.y;                    
                    let cvec_x=nvec_y*hsize;
                    let cvec_y=-nvec_x*hsize;
                    
                    vec_a.Set(pt.pos.x+cvec_x, pt.pos.y+cvec_y);
                    vec_b.Set(pt.pos.x-cvec_x, pt.pos.y-cvec_y);
                    vec_c.Set(p2_x-cvec_x,p2_y-cvec_y);
                    vec_d.Set(p2_x+cvec_x,p2_y+cvec_y);
                    if(obj.image) {
                        vec_1.Set(obj.image.uv1.x, obj.image.uv1.y);
                        vec_2.Set(obj.image.uv2.x, obj.image.uv1.y);
                        vec_3.Set(obj.image.uv2.x, obj.image.uv2.y);
                        vec_4.Set(obj.image.uv1.x, obj.image.uv2.y);
                        drawlist.AddImageQuad(obj.image.texture._texture,
                            vec_a, vec_b, vec_c, vec_d,
                            vec_1, vec_2, vec_3, vec_4, col
                        );
                    }else {
                        drawlist.AddQuadFilled(vec_a, vec_b, vec_c, vec_d, col);
                    }

                    continue;
                }
            }
            let px=pt.pos.x+xy.x;
            let py=pt.pos.y+xy.y;
            vec_a.Set(px-hsize, py-hsize);
            vec_b.Set(px+hsize, py+hsize);

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

class PaintMgr extends PaintWin
{
    constructor(backend:BackendImGui) {
        super(backend);
    }

    Paint() {
        let obj=this.obj as UIMgr;
        let backend=this.backend;
        backend.is_down=false;
        backend.is_up=false;
        backend.is_move=false;

        if(!backend.prev_mouse_pos.Equal(obj.mouse_pos.x, obj.mouse_pos.y)) {
            backend.is_move=true;
            backend.prev_mouse_pos.Set(obj.mouse_pos.x, obj.mouse_pos.y);
        }

        if(backend.prev_down!=obj.any_pointer_down) {
            if(obj.any_pointer_down) {
                backend.is_down=true;
            }else {
                backend.is_up=true;
            }
            backend.prev_down=obj.any_pointer_down;
        }


        super.Paint();
    }
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
        this.paint[zlUILabelEdit.CSID]=new PaintPanel(this);
        this.paint[zlUIParticle.CSID]=new PaintParticle(this);
        this.paint[zlUIMgr.CSID]=new PaintMgr(this);
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
            return;
        }
        if(!this.parent?.IsVisible(obj))
            return;

        paint.obj=obj;
        paint.Paint();
        paint.obj=null;
    }
    PaintEnd(obj: zlUIWin) 
    {
    }
    SetParent(obj: zlUIWin) 
    {
        this.parent=obj;
    }

    prev_mouse_pos:Vec2=new Vec2;
    prev_down:boolean=false;
    is_down:boolean=false;
    is_up:boolean=false;
    is_move:boolean=false;

    paint:{[key:string]:IPaint};
    
    has_astc:boolean;
    enable_astc:boolean=false;

    font:ImFont;
    drawlist:ImGui.ImDrawList;

    parent:zlUIWin;
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
