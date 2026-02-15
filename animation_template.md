# A-Frame アニメーション一覧（HTMLのみ）

---

## 基本構文

```html
animation__name="
  property: 対象プロパティ;
  from: 開始値;
  to: 終了値;
  dur: 時間(ms);
  easing: イージング;
  dir: 方向;
  loop: true;
"
```

---

## ① 位置（`position`）

**用途**

* 浮遊
* 上下移動
* ゆらゆら

```html
animation__float="
  property: position;
  dir: alternate;
  dur: 2400;
  easing: easeInOutSine;
  loop: true;
  to: 0 0.12 0
"
```

**ポイント**

* Zは動かさない
* Yのみ動かすと安定

---

## ② 回転（`rotation`）

**用途**

* 傾き
* 揺れ
* 回転エフェクト

```html
animation__sway="
  property: rotation;
  dir: alternate;
  dur: 3000;
  easing: easeInOutSine;
  loop: true;
  to: 0 0 5
"
```

```html
animation__spin="
  property: rotation;
  dur: 10000;
  loop: true;
  to: 0 0 360
"
```

**ポイント**

* Z回転が最も安全
* ±20°以内推奨

---

## ③ 拡大縮小（`scale`）

**用途**

* 呼吸
* 強調
* ポップ演出

```html
animation__scale="
  property: scale;
  dir: alternate;
  dur: 1500;
  easing: easeInOutSine;
  loop: true;
  to: 1.1 1.1 1
"
```

---

## ④ 透明度（`material.opacity`）

**用途**

* フェード
* 発光
* キラキラ

```html
animation__fade="
  property: material.opacity;
  dir: alternate;
  dur: 1800;
  easing: easeInOutSine;
  loop: true;
  from: 0.6;
  to: 1
"
```

**必須設定**

```html
material="transparent: true"
```

---

## ⑤ 色変化（`material.color`）

**用途**

* ネオン
* 魔法感
* 強調表示

```html
animation__color="
  property: material.color;
  dir: alternate;
  dur: 2000;
  easing: easeInOutSine;
  loop: true;
  from: #ffffff;
  to: #ff99ff
"
```

**注意**

* 写真・ベースイラストには不向き
* 文字・エフェクト向け

---

## ⑥ テクスチャ切替（`material.src`）

**用途**

* 瞬き
* 点滅
* 2フレーム演出

```html
animation__swap="
  property: material.src;
  dir: alternate;
  dur: 400;
  loop: true;
  from: #tex1;
  to: #tex2
"
```

**注意**

* 実用は2枚切替まで
* 複数フレームはJS推奨

---

## ⑦ 表示／非表示（`visible`）

**用途**

* 出現演出
* 条件付き表示

```html
animation__show="
  property: visible;
  from: false;
  to: true
"
```

※ 使用頻度は低め

---

## ⑧ mixin（アニメーション再利用）

**用途**

* 共通アニメーションのテンプレ化
* 複数要素に同じ動きを付与

```html
<a-mixin
  id="floatAnim"
  animation="
    property: position;
    dir: alternate;
    dur: 2400;
    easing: easeInOutSine;
    loop: true;
    to: 0 0.12 0
  "
></a-mixin>
```

```html
<a-plane mixin="floatAnim"></a-plane>
```

**ポイント**

* 調整は1か所だけ
* レイヤーが増えるほど必須

---

## ⑨ イベント制御（`startEvents / pauseEvents`）

**用途**

* targetFound / targetLost
* 撮影モード

```html
animation__float="
  property: position;
  startEvents: play;
  pauseEvents: stop;
  loop: true;
  to: 0 0.1 0
"
```

---

## 組み合わせ例

* **発光エフェクト**
  `opacity + scale + rotation(Z)`

* **浮遊表現**
  `position(Y) + rotation`

* **強調文字**
  `rotation + opacity`

---

## 避けるべきアニメーション

* Z位置の大きな移動（チラつき）
* 高速回転（酔い）
* 激しいscale（マーカー破綻）
* 全レイヤー同時アニメ（情報過多）

---

## まとめ

**よく使う基本4種**

* position
* rotation
* scale
* material.opacity

**装飾系**

* material.color
* material.src

**設計用**

* mixin
* startEvents / pauseEvents

