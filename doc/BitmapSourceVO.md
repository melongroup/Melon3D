[返回Main](./Main.md) 
# BitmapSourceVO

> 参考
    
[BitmapSource.ts](./BitmapSource.md)

[Melon.ts](./)


> 结构 IBitmapSourceVO
```javascript
                |
(ul, vt)->·—————·—————·<-(ur, vt)
          |     |     |
       ———·—————·—————·———
          |     |     |
(ul, vb)->·—————·—————·<-(ur, vb)
                |

interface BitmapSourceVO {
    name: string;
    x: number;// 图集中的x
    y: number;// 图集中的y
    ix: number;// 相对于图集中图片还原至原始图片的偏移值x
    iy: number;// 相对于图集中图片还原至原始图片的偏移值y
    w: number;// 图集中图片宽度
    h: number;// 图集中图片高度
    rw: number;// 原始图片宽度
    rh: number;// 原始图片高度
    ul: number;// uv
    ur: number;// uv
    vt: number;// uv
    vb: number;// uv
}
```

> 创建、设置、获取
        
        1、矢量图
            · 引擎初始化时，自动创建提供矢量图使用的BitmapSourceVO；其大小为1*1
            
            · 通过“origin”字符串获取
                this.source.frames["origin"];

        2、位图
            · 创建一个Image()对象

            · 图片加载完成后Image对象调用类型为BitmapSource的source对象上的drawimg方法（若此图片的BitmapSourceVO存在，则调用source对象上的getEmptySourceVO方法）
                > 调用drawimg方法传入所需参数
                    image [HTMLImageElement | HTMLCanvasElement | BitmapData] 所加载的图片数据
                    x [number] BitmapSourceVO上的数据，x通过为image的width、height获取，值为0
                    y [number] BitmapSourceVO上的数据，y通过为image的width、height获取，值为1
                    width [number] 图片的宽度
                    height [number] 图片的高度
                > 调用getEmptySourceVO方法传入所需参数
                    name [string] 加载图片的url
                    width [number] 图片的宽度
                    height [number] 图片的高度

            · 获取到vo后，使用Graphics对象上的drawBitmap方法进行绘制
                this.graphics.drawBitmap(0, 0, vo);
                > 调用drawBitmap方法
                    x [number] x坐标
                    y [number] y坐标
                    vo [BitmapSourceVO]
                > ps: 绘制的xy坐标不等于Sprite坐标

            · 通过当前加载图片的url字符串获取
                this.source.frames[url];