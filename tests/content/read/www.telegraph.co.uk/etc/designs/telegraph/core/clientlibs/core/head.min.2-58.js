(function(window){var emptyFn=function(){};
if(window.location.hash!=="#debug"&&console){console.log("Please add #debug to see logs");
if(console.log){console.log=emptyFn
}if(console.debug){console.debug=emptyFn
}if(console.warn){console.warn=emptyFn
}if(console.info){console.info=emptyFn
}}window.tmg=window.tmg||{};
window.tmg.viewport={width:document.documentElement.clientWidth,dpr:1,mediaQueriesBreakpoints:{xxs:0,xs:480,sm:730,md:988,lg:1008,xl:1328},containerSizes:{sm:740,md:960,lg:1280}};
window.tmg.addEvent=function(elem,type,eventHandle){if(elem===null||elem===undefined){return
}if(elem.addEventListener){elem.addEventListener(type,eventHandle,false)
}else{if(elem.attachEvent){elem.attachEvent("on"+type,eventHandle)
}else{elem["on"+type]=eventHandle
}}};
window.tmg.getViewportWidth=function(excludeScroll){if(typeof(excludeScroll)==="undefined"){excludeScroll=true
}if(excludeScroll&&document.documentElement.clientWidth>=0){return document.documentElement.clientWidth
}else{if(excludeScroll&&document.body&&document.body.clientWidth>=0){return document.body.clientWidth
}else{if(window.innerWidth>=0){return window.innerWidth
}else{return 0
}}}};
window.tmg.getMediaQuery=function(){var defaultMQ="xxs",body=document.body,div=document.getElementById("tmgMediaQuery");
if(!div&&body){div=document.createElement("div");
div.id="tmgMediaQuery";
body.appendChild(div)
}if(!window.getComputedStyle||!body){return defaultMQ
}return window.getComputedStyle(div,":after").content.replace(/[^a-z]/g,"")||defaultMQ
};
window.tmg.loadClientLibs={init:function(){if(typeof yepnope==="function"){var transposedClientlibs=this.transposeClientlibs(window.clientlibs);
var yepnopeClientlibs={load:transposedClientlibs.load,complete:function(){var node=document.getElementsByTagName("script")[0];
for(var index=0;
index<transposedClientlibs.completeCallback.length;
index++){var script=document.createElement("script");
script.type="text/javascript";
script[script.innerText?"innerText":"textContent"]=transposedClientlibs.completeCallback[index];
node.parentNode.insertBefore(script,node)
}}.bind(this)};
yepnope(yepnopeClientlibs)
}},transposeClientlibs:function(tmpObj,treeString,skipTest){var response={load:[],completeCallback:[]};
if(!!tmpObj.test&&(skipTest===undefined||skipTest===false)){if(!eval(tmpObj.test)){response=this.transposeClientlibs(tmpObj,(!!treeString?treeString+".":"")+key,true)
}}else{for(var key in tmpObj){if(tmpObj.hasOwnProperty(key)&&key!=="test"){if(key==="load"){response.load=response.load.concat(tmpObj[key])
}else{if(key==="completeCallback"){response.completeCallback=response.completeCallback.concat(tmpObj[key])
}else{if(typeof tmpObj[key]==="object"){var tmpResponse=this.transposeClientlibs(tmpObj[key],(!!treeString?treeString+".":"")+key);
response.load=response.load.concat(tmpResponse.load);
response.completeCallback=response.completeCallback.concat(tmpResponse.completeCallback)
}else{console.warn("clientlib on "+treeString+" has an unsuported property of "+key)
}}}}}}return response
}};
window.tmg.timer=function(callback,delay){var _this=this,timerId,start,remaining=delay;
this.pause=function(){window.clearTimeout(timerId);
remaining-=new Date()-start
};
this.resume=function(){start=new Date();
window.clearTimeout(timerId);
timerId=window.setTimeout(function(){callback.call(_this)
},remaining)
};
this.stop=function(){window.clearTimeout(timerId);
remaining=0
};
this.status=function(){return timerId
};
this.resume()
}
}(window));
var print_uk_day=function(d){var i=function(j){if(j>3&&j<21){return j+"th"
}switch(j%10){case 1:return j+"st";
case 2:return j+"nd";
case 3:return j+"rd";
default:return j+"th"
}},a=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],c=["January","February","March","April","May","June","July","August","September","October","November","December"],g,e,f,b,h=new Date();
if(isNaN(d)){d=0
}d=d*1;
b=new Date(h.getTime()+d+(h.getTimezoneOffset()*60000));
g=b.getDate();
e=b.getMonth();
f=b.getDay();
document.write("<span>"+a[f]+" "+i(g)+" "+c[e]+"</span>")
};
window.tmg=window.tmg||{};
tmg.GET_PARAM={};
(function(){if([].forEach){location.search.substr(1).split("&").forEach(function(a){var b=a.split("=");
if(b.length>1){tmg.GET_PARAM[b[0]]=b[1]
}else{tmg.GET_PARAM[b[0]]=""
}})
}})();
(function(b){if(typeof window.CustomEvent==="function"){return false
}function a(d,e){e=e||{bubbles:false,cancelable:false,detail:b};
var c=document.createEvent("CustomEvent");
c.initCustomEvent(d,e.bubbles||false,e.cancelable||false,e.detail||b);
return c
}a.prototype=window.Event.prototype;
window.CustomEvent=a
})();
(function(){if(typeof String.prototype.endsWith==="function"){return false
}String.prototype.endsWith=function(c,b){var a=this.toString(),d;
if(typeof b!=="number"||!isFinite(b)||Math.floor(b)!==b||b>a.length){b=a.length
}b-=c.length;
d=a.indexOf(c,b);
return d!==-1&&d===b
}
})();
(function(l,G,e){var F=G.documentElement,o=l.setTimeout,C=G.getElementsByTagName("script")[0],B={}.toString,f=[],c=0,g=function(){},t=("MozAppearance" in F.style),n=t&&!!G.createRange().compareNode,v=n?F:C.parentNode,E=l.opera&&B.call(l.opera)=="[object Opera]",A=!!G.attachEvent&&!E,j=t?"object":A?"script":"img",w=A?"script":j,q=Array.isArray||function(H){return B.call(H)=="[object Array]"
},p=function(H){return Object(H)===H
},r=function(H){return typeof H=="string"
},b=function(H){return B.call(H)=="[object Function]"
},i=[],z={},D={timeout:function(I,H){if(H.length){I.timeout=H[0]
}return I
}},d,m;
function s(H){return(!H||H=="loaded"||H=="complete"||H=="uninitialized")
}function h(H,I,P,N,J,M){var O=G.createElement("script"),K,L;
N=N||m.errorTimeout;
O.src=H;
for(L in P){O.setAttribute(L,P[L])
}I=M?u:(I||g);
O.onreadystatechange=O.onload=function(){if(!K&&s(O.readyState)){K=1;
I();
O.onload=O.onreadystatechange=null
}};
o(function(){if(!K){K=1;
I(1)
}},N);
J?O.onload():C.parentNode.insertBefore(O,C)
}function a(H,I,P,N,J,M){var O=G.createElement("link"),K,L;
N=N||m.errorTimeout;
I=M?u:(I||g);
O.href=H;
O.rel="stylesheet";
O.type="text/css";
for(L in P){O.setAttribute(L,P[L])
}if(!J){C.parentNode.insertBefore(O,C);
o(I,0)
}}function u(){var H=f.shift();
c=1;
if(H){if(H.t){o(function(){(H.t=="c"?m.injectCss:m.injectJs)(H.s,0,H.a,H.x,H.e,1)
},0)
}else{H();
u()
}}else{c=0
}}function y(J,H,Q,I,O,S,R){R=R||m.errorTimeout;
var P=G.createElement(J),M=0,N=0,L={t:Q,s:H,e:O,a:S,x:R};
if(z[H]===1){N=1;
z[H]=[]
}function K(U){if(!M&&s(P.readyState)){L.r=M=1;
!c&&u();
P.onload=P.onreadystatechange=null;
if(U){if(J!="img"){o(function(){v.removeChild(P)
},50)
}for(var T in z[H]){if(z[H].hasOwnProperty(T)){z[H][T].onload()
}}}}}if(J=="object"){P.data=H
}else{P.src=H;
P.type=J
}P.width=P.height="0";
P.onerror=P.onload=P.onreadystatechange=function(){K.call(this,N)
};
f.splice(I,0,L);
if(J!="img"){if(N||z[H]===2){v.insertBefore(P,n?null:C);
o(K,R)
}else{z[H].push(P)
}}}function k(L,J,I,H,K){c=0;
J=J||"j";
if(r(L)){y(J=="c"?w:j,L,J,this["i"]++,I,H,K)
}else{f.splice(this["i"]++,0,L);
f.length==1&&u()
}return this
}function x(){var H=m;
H.loader={load:k,i:0};
return H
}m=function(L){var K,M,J=this["yepnope"]["loader"];
function H(P){var S=P.split("!"),X=i.length,R=S.pop(),U=S.length,V={url:R,origUrl:R,prefixes:S},Q,T,W;
for(T=0;
T<U;
T++){W=S[T].split("=");
Q=D[W.shift()];
if(Q){V=Q(V,W)
}}for(T=0;
T<X;
T++){V=i[T](V)
}return V
}function O(P){return P.split(".").pop().split("?").shift()
}function I(Q,W,S,R,P){var U=H(Q),T=U.autoCallback,V=O(U.url);
if(U.bypass){return
}if(W){W=b(W)?W:W[Q]||W[R]||W[(Q.split("/").pop().split("?")[0])]
}if(U.instead){return U.instead(Q,W,S,R,P)
}else{if(z[U.url]){U.noexec=true
}else{z[U.url]=1
}S.load(U.url,((U.forceCSS||(!U.forceJS&&"css"==O(U.url))))?"c":e,U.noexec,U.attrs,U.timeout);
if(b(W)||b(T)){S.load(function(){x();
W&&W(U.origUrl,P,R);
T&&T(U.origUrl,P,R);
z[U.url]=2
})
}}}function N(R,P){var X=!!R.test,Y=X?R.yep:R.nope,T=R.load||R.both,Z=R.callback||g,Q=Z,S=R.complete||g,W,V;
function U(aa,ab){if(!aa){!ab&&S()
}else{if(r(aa)){if(!ab){Z=function(){var ac=[].slice.call(arguments);
Q.apply(this,ac);
S()
}
}I(aa,Z,P,0,X)
}else{if(p(aa)){W=(function(){var ad=0,ac;
for(ac in aa){if(aa.hasOwnProperty(ac)){ad++
}}return ad
})();
for(V in aa){if(aa.hasOwnProperty(V)){if(!ab&&!(--W)){if(!b(Z)){Z[V]=(function(ac){return function(){var ad=[].slice.call(arguments);
ac&&ac.apply(this,ad);
S()
}
})(Q[V])
}else{Z=function(){var ac=[].slice.call(arguments);
Q.apply(this,ac);
S()
}
}}I(aa[V],Z,P,V,X)
}}}}}}U(Y,!!T);
T&&U(T)
}if(r(L)){I(L,0,J,0)
}else{if(q(L)){for(K=0;
K<L.length;
K++){M=L[K];
if(r(M)){I(M,0,J,0)
}else{if(q(M)){m(M)
}else{if(p(M)){N(M,J)
}}}}}else{if(p(L)){N(L,J)
}}}};
m.addPrefix=function(H,I){D[H]=I
};
m.addFilter=function(H){i.push(H)
};
m.errorTimeout=10000;
if(G.readyState==null&&G.addEventListener){G.readyState="loading";
G.addEventListener("DOMContentLoaded",d=function(){G.removeEventListener("DOMContentLoaded",d,0);
G.readyState="complete"
},0)
}l.yepnope=x();
l.yepnope["executeStack"]=u;
l.yepnope["injectJs"]=h;
l.yepnope["injectCss"]=a
})(this,document);
window.Modernizr=(function(A,c,g){var H="2.8.3",w={},y=true,K=c.documentElement,a="modernizr",G=c.createElement(a),C=G.style,J,b={}.toString,j=" -webkit- -moz- -o- -ms- ".split(" "),h="Webkit Moz O ms",D=h.split(" "),I=h.toLowerCase().split(" "),F={svg:"http://www.w3.org/2000/svg"},l={},p={},f={},e=[],k=e.slice,s,n=function(T,V,N,U){var M,S,P,Q,L=c.createElement("div"),R=c.body,O=R||c.createElement("body");
if(parseInt(N,10)){while(N--){P=c.createElement("div");
P.id=U?U[N]:a+(N+1);
L.appendChild(P)
}}M=["&#173;",'<style id="s',a,'">',T,"</style>"].join("");
L.id=a;
(R?L:O).innerHTML+=M;
O.appendChild(L);
if(!R){O.style.background="";
O.style.overflow="hidden";
Q=K.style.overflow;
K.style.overflow="hidden";
K.appendChild(O)
}S=V(L,T);
if(!R){O.parentNode.removeChild(O);
K.style.overflow=Q
}else{L.parentNode.removeChild(L)
}return !!S
},E=function(N){var M=A.matchMedia||A.msMatchMedia;
if(M){return M(N)&&M(N).matches||false
}var L;
n("@media "+N+" { #"+a+" { position: absolute; } }",function(O){L=(A.getComputedStyle?getComputedStyle(O,null):O.currentStyle)["position"]=="absolute"
});
return L
},o=(function(){var M={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};
function L(N,P){P=P||c.createElement(M[N]||"div");
N="on"+N;
var O=N in P;
if(!O){if(!P.setAttribute){P=c.createElement("div")
}if(P.setAttribute&&P.removeAttribute){P.setAttribute(N,"");
O=r(P[N],"function");
if(!r(P[N],"undefined")){P[N]=g
}P.removeAttribute(N)
}}P=null;
return O
}return L
})(),i=({}).hasOwnProperty,x;
if(!r(i,"undefined")&&!r(i.call,"undefined")){x=function(L,M){return i.call(L,M)
}
}else{x=function(L,M){return((M in L)&&r(L.constructor.prototype[M],"undefined"))
}
}if(!Function.prototype.bind){Function.prototype.bind=function d(N){var O=this;
if(typeof O!="function"){throw new TypeError()
}var L=k.call(arguments,1),M=function(){if(this instanceof M){var R=function(){};
R.prototype=O.prototype;
var Q=new R();
var P=O.apply(Q,L.concat(k.call(arguments)));
if(Object(P)===P){return P
}return Q
}else{return O.apply(N,L.concat(k.call(arguments)))
}};
return M
}
}function B(L){C.cssText=L
}function u(M,L){return B(j.join(M+";")+(L||""))
}function r(M,L){return typeof M===L
}function t(M,L){return !!~(""+M).indexOf(L)
}function z(N,L){for(var M in N){var O=N[M];
if(!t(O,"-")&&C[O]!==g){return L=="pfx"?O:true
}}return false
}function q(M,P,O){for(var L in M){var N=P[M[L]];
if(N!==g){if(O===false){return M[L]
}if(r(N,"function")){return N.bind(O||P)
}return N
}}return false
}function m(P,L,O){var M=P.charAt(0).toUpperCase()+P.slice(1),N=(P+" "+D.join(M+" ")+M).split(" ");
if(r(L,"string")||r(L,"undefined")){return z(N,L)
}else{N=(P+" "+(I).join(M+" ")+M).split(" ");
return q(N,L,O)
}}l.flexbox=function(){return m("flexWrap")
};
l.flexboxlegacy=function(){return m("boxDirection")
};
l.touch=function(){var L;
if(("ontouchstart" in A)||A.DocumentTouch&&c instanceof DocumentTouch){L=true
}else{n(["@media (",j.join("touch-enabled),("),a,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(M){L=M.offsetTop===9
})
}return L
};
l.backgroundsize=function(){return m("backgroundSize")
};
l.csscolumns=function(){return m("columnCount")
};
l.svg=function(){return !!c.createElementNS&&!!c.createElementNS(F.svg,"svg").createSVGRect
};
l.inlinesvg=function(){var L=c.createElement("div");
L.innerHTML="<svg/>";
return(L.firstChild&&L.firstChild.namespaceURI)==F.svg
};
for(var v in l){if(x(l,v)){s=v.toLowerCase();
w[s]=l[v]();
e.push((w[s]?"":"no-")+s)
}}w.addTest=function(M,N){if(typeof M=="object"){for(var L in M){if(x(M,L)){w.addTest(L,M[L])
}}}else{M=M.toLowerCase();
if(w[M]!==g){return w
}N=typeof N=="function"?N():N;
if(typeof y!=="undefined"&&y){K.className+=" "+(N?"":"no-")+M
}w[M]=N
}return w
};
B("");
G=J=null;
w._version=H;
w._prefixes=j;
w._domPrefixes=I;
w._cssomPrefixes=D;
w.mq=E;
w.hasEvent=o;
w.testProp=function(L){return z([L])
};
w.testAllProps=m;
w.testStyles=n;
w.prefixed=function(N,M,L){if(!M){return m(N,"pfx")
}else{return m(N,M,L)
}};
K.className=K.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(y?" js "+e.join(" "):"");
return w
})(this,this.document);
(function(p,t){var j="3.7.0";
var g=p.html5||{};
var k=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;
var e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;
var y;
var l="_html5shiv";
var c=0;
var v={};
var h;
(function(){try{var B=t.createElement("a");
B.innerHTML="<xyz></xyz>";
y=("hidden" in B);
h=B.childNodes.length==1||(function(){(t.createElement)("a");
var D=t.createDocumentFragment();
return(typeof D.cloneNode=="undefined"||typeof D.createDocumentFragment=="undefined"||typeof D.createElement=="undefined")
}())
}catch(C){y=true;
h=true
}}());
function i(B,D){var E=B.createElement("p"),C=B.getElementsByTagName("head")[0]||B.documentElement;
E.innerHTML="x<style>"+D+"</style>";
return C.insertBefore(E.lastChild,C.firstChild)
}function r(){var B=o.elements;
return typeof B=="string"?B.split(" "):B
}function x(B){var C=v[B[l]];
if(!C){C={};
c++;
B[l]=c;
v[c]=C
}return C
}function u(E,B,D){if(!B){B=t
}if(h){return B.createElement(E)
}if(!D){D=x(B)
}var C;
if(D.cache[E]){C=D.cache[E].cloneNode()
}else{if(e.test(E)){C=(D.cache[E]=D.createElem(E)).cloneNode()
}else{C=D.createElem(E)
}}return C.canHaveChildren&&!k.test(E)&&!C.tagUrn?D.frag.appendChild(C):C
}function z(D,F){if(!D){D=t
}if(h){return D.createDocumentFragment()
}F=F||x(D);
var G=F.frag.cloneNode(),E=0,C=r(),B=C.length;
for(;
E<B;
E++){G.createElement(C[E])
}return G
}function A(B,C){if(!C.cache){C.cache={};
C.createElem=B.createElement;
C.createFrag=B.createDocumentFragment;
C.frag=C.createFrag()
}B.createElement=function(D){if(!o.shivMethods){return C.createElem(D)
}return u(D,B,C)
};
B.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+r().join().replace(/\w+/g,function(D){C.createElem(D);
C.frag.createElement(D);
return'c("'+D+'")'
})+");return n}")(o,C.frag)
}function d(B){if(!B){B=t
}var C=x(B);
if(o.shivCSS&&!y&&!C.hasCSS){C.hasCSS=!!i(B,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")
}if(!h){A(B,C)
}return B
}var o={elements:g.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:j,shivCSS:(g.shivCSS!==false),supportsUnknownElements:h,shivMethods:(g.shivMethods!==false),type:"default",shivDocument:d,createElement:u,createDocumentFragment:z};
p.html5=o;
d(t);
var b=/^$|\b(?:all|print)\b/;
var m="html5shiv";
var s=!h&&(function(){var B=t.documentElement;
return !(typeof t.namespaces=="undefined"||typeof t.parentWindow=="undefined"||typeof B.applyElement=="undefined"||typeof B.removeNode=="undefined"||typeof p.attachEvent=="undefined")
}());
function f(F){var G,D=F.getElementsByTagName("*"),E=D.length,C=RegExp("^(?:"+r().join("|")+")$","i"),B=[];
while(E--){G=D[E];
if(C.test(G.nodeName)){B.push(G.applyElement(w(G)))
}}return B
}function w(D){var E,B=D.attributes,C=B.length,F=D.ownerDocument.createElement(m+":"+D.nodeName);
while(C--){E=B[C];
E.specified&&F.setAttribute(E.nodeName,E.nodeValue)
}F.style.cssText=D.style.cssText;
return F
}function a(E){var G,F=E.split("{"),C=F.length,B=RegExp("(^|[\\s,>+~])("+r().join("|")+")(?=[[\\s,>+~#.:]|$)","gi"),D="$1"+m+"\\:$2";
while(C--){G=F[C]=F[C].split("}");
G[G.length-1]=G[G.length-1].replace(B,D);
F[C]=G.join("}")
}return F.join("{")
}function q(C){var B=C.length;
while(B--){C[B].removeNode()
}}function n(B){var H,F,E=x(B),D=B.namespaces,G=B.parentWindow;
if(!s||B.printShived){return B
}if(typeof D[m]=="undefined"){D.add(m)
}function C(){clearTimeout(E._removeSheetTimer);
if(H){H.removeNode(true)
}H=null
}G.attachEvent("onbeforeprint",function(){C();
var I,M,K,O=B.styleSheets,L=[],J=O.length,N=Array(J);
while(J--){N[J]=O[J]
}while((K=N.pop())){if(!K.disabled&&b.test(K.media)){try{I=K.imports;
M=I.length
}catch(P){M=0
}for(J=0;
J<M;
J++){N.push(I[J])
}try{L.push(K.cssText)
}catch(P){}}}L=a(L.reverse().join(""));
F=f(B);
H=i(B,L)
});
G.attachEvent("onafterprint",function(){q(F);
clearTimeout(E._removeSheetTimer);
E._removeSheetTimer=setTimeout(C,500)
});
B.printShived=true;
return B
}o.type+=" print";
o.shivPrint=n;
n(t)
}(this,document));
var cssua=(function(f,m){var e=" ua-";
var i=/\s*([\-\w ]+)[\s\/\:]([\d_]+\b(?:[\-\._\/]\w+)*)/;
var g=/([\w\-\.]+[\s\/][v]?[\d_]+\b(?:[\-\._\/]\w+)*)/g;
var c=/\b(?:(blackberry\w*|bb10)|(rim tablet os))(?:\/(\d+\.\d+(?:\.\w+)*))?/;
var k=/\bsilk-accelerated=true\b/;
var h=/\bfluidapp\b/;
var b=/(\bwindows\b|\bmacintosh\b|\blinux\b|\bunix\b)/;
var l=/(\bandroid\b|\bipad\b|\bipod\b|\bwindows phone\b|\bwpdesktop\b|\bxblwp7\b|\bzunewp7\b|\bwindows ce\b|\bblackberry\w*|\bbb10\b|\brim tablet os\b|\bmeego|\bwebos\b|\bpalm|\bsymbian|\bj2me\b|\bdocomo\b|\bpda\b|\bchtml\b|\bmidp\b|\bcldc\b|\w*?mobile\w*?|\w*?phone\w*?)/;
var j=/(\bxbox\b|\bplaystation\b|\bnintendo\s+\w+)/;
var d={parse:function(q){var o={};
q=(""+q).toLowerCase();
if(!q){return o
}var t,v,y=q.split(/[()]/);
for(var s=0,n=y.length;
s<n;
s++){if(s%2){var u=y[s].split(";");
for(t=0,v=u.length;
t<v;
t++){if(i.exec(u[t])){var x=RegExp.$1.split(" ").join("_"),p=RegExp.$2;
if((!o[x]||parseFloat(o[x])<parseFloat(p))){o[x]=p
}}}}else{var w=y[s].match(g);
if(w){for(t=0,v=w.length;
t<v;
t++){var r=w[t].split(/[\/\s]+/);
if(r.length&&r[0]!=="mozilla"){o[r[0].split(" ").join("_")]=r.slice(1).join("-")
}}}}}if(l.exec(q)){o.mobile=RegExp.$1;
if(c.exec(q)){delete o[o.mobile];
o.blackberry=o.version||RegExp.$3||RegExp.$2||RegExp.$1;
if(RegExp.$1){o.mobile="blackberry"
}else{if(o.version==="0.0.1"){o.blackberry="7.1.0.0"
}}}}else{if(b.exec(q)){o.desktop=RegExp.$1
}else{if(j.exec(q)){o.game=RegExp.$1;
var z=o.game.split(" ").join("_");
if(o.version&&!o[z]){o[z]=o.version
}}}}if(o.intel_mac_os_x){o.mac_os_x=o.intel_mac_os_x.split("_").join(".");
delete o.intel_mac_os_x
}else{if(o.cpu_iphone_os){o.ios=o.cpu_iphone_os.split("_").join(".");
delete o.cpu_iphone_os
}else{if(o.cpu_os){o.ios=o.cpu_os.split("_").join(".");
delete o.cpu_os
}else{if(o.mobile==="iphone"&&!o.ios){o.ios="1"
}}}}if(o.opera&&o.version){o.opera=o.version;
delete o.blackberry
}else{if(k.exec(q)){o.silk_accelerated=true
}else{if(h.exec(q)){o.fluidapp=o.version
}}}if(o.applewebkit){o.webkit=o.applewebkit;
delete o.applewebkit;
if(o.opr){o.opera=o.opr;
delete o.opr;
delete o.chrome
}if(o.safari){if(o.chrome||o.crios||o.opera||o.silk||o.fluidapp||o.phantomjs||(o.mobile&&!o.ios)){delete o.safari
}else{if(o.version&&!o.rim_tablet_os){o.safari=o.version
}else{o.safari=({"419":"2.0.4","417":"2.0.3","416":"2.0.2","412":"2.0","312":"1.3","125":"1.2","85":"1.0"})[parseInt(o.safari,10)]||o.safari
}}}}else{if(o.msie||o.trident){if(!o.opera){o.ie=o.msie||o.rv
}delete o.msie;
if(o.windows_phone_os){o.windows_phone=o.windows_phone_os;
delete o.windows_phone_os
}else{if(o.mobile==="wpdesktop"||o.mobile==="xblwp7"||o.mobile==="zunewp7"){o.mobile="windows desktop";
o.windows_phone=(+o.ie<9)?"7.0":(+o.ie<10)?"7.5":"8.0";
delete o.windows_nt
}}}else{if(o.gecko||o.firefox){o.gecko=o.rv
}}}if(o.rv){delete o.rv
}if(o.version){delete o.version
}return o
},format:function(p){function q(r,s){r=r.split(".").join("-");
var u=e+r;
if(typeof s==="string"){s=s.split(" ").join("_").split(".").join("-");
var t=s.indexOf("-");
while(t>0){u+=e+r+"-"+s.substring(0,t);
t=s.indexOf("-",t+1)
}u+=e+r+"-"+s
}return u
}var o="";
for(var n in p){if(n&&p.hasOwnProperty(n)){o+=q(n,p[n])
}}return o
},encode:function(o){var p="";
for(var n in o){if(n&&o.hasOwnProperty(n)){if(p){p+="&"
}p+=encodeURIComponent(n)+"="+encodeURIComponent(o[n])
}}return p
}};
d.userAgent=d.ua=d.parse(m);
var a=d.format(d.ua)+" js";
if(f.className){f.className=f.className.replace(/\bno-js\b/g,"")+a
}else{f.className=a.substr(1)
}return d
})(document.documentElement,navigator.userAgent);
if(!window.lzld){var tmg=typeof(tmg)==="undefined"?{}:tmg;
tmg.lzld=function(R,g,V,A,F){var aa=0,f=["ms","moz","webkit","o"],K;
for(K=0;
K<f.length&&!R[V];
++K){R[V]=R[f[K]+"RequestAnimationFrame"];
R[A]=R[f[K]+"CancelAnimationFrame"]||R[f[K]+"CancelRequestAnimationFrame"]
}if(!R[V]){R[V]=function(ad){var x=new Date().getTime(),ab=Math.max(0,16-(x-aa)),ac=R.setTimeout(function(){ad(x+ab)
},ab);
aa=x+ab;
return ac
}
}if(!R[A]){R[A]=function(x){R.clearTimeout(x)
}
}var Y={},N=150,S="lazyload_bandwidth",Z=true,E=!!(tmg&&tmg.bandwidth&&tmg.bandwidth.noOfMeasurements)?tmg.bandwidth.measurements:5,G=!!(tmg&&tmg.bandwidth&&tmg.bandwidth.limit)?tmg.bandwidth.upperLimit:14000,l=c(),O="data-frz-src",r="data-frz-parent",Q="data-frz-ratio",h="data-frz-src-array",M="data-frz-persist",u="data-frz-use-parent",b=P(),H=[],q=false,t=false,W=function(){R.requestAnimationFrame(d)
},y=function(){R.requestAnimationFrame(L)
},I="data-frz-ancestor",v;
R.HTMLImageElement&&J();
R.lzld=T;
function p(){var ac=g.getElementsByTagName("img"),ad;
for(var ab=0,x=ac.length;
ab<x;
ab+=1){ad=ac[ab];
if((ad.getAttribute(O)||ad.getAttribute(h))&&!!ad.getAttribute("onload")&&D({img:ad},H,"img")===-1){H.push({img:ad})
}}L();
setTimeout(y,25)
}w(p);
k(R,"load",U);
m();
function T(x){v=!!g.querySelector("["+I+"]");
if(D({img:x},H,"img")===-1){if(t){m()
}Y.showIfVisible(x,H.push({img:x})-1)
}}function U(){q=true;
y();
setTimeout(y,25)
}function k(ac,ab,x){if(ac.attachEvent){ac.attachEvent&&ac.attachEvent("on"+ab,x)
}else{ac.addEventListener(ab,x,false)
}}function a(ac,ab,x){if(ac.detachEvent){ac.detachEvent&&ac.detachEvent("on"+ab,x)
}else{ac.removeEventListener(ab,x,false)
}}function w(af){var x=false,ac=true;
function ae(ag){if(ag.type==="readystatechange"&&g.readyState!=="complete"){return
}a((ag.type==="load"?R:g),ag.type,ae);
if(!x){x=true;
af()
}}function ad(){try{g.documentElement.doScroll("left")
}catch(ag){setTimeout(ad,50);
return
}ae("poll")
}if(g.readyState==="complete"){af()
}else{if(g.createEventObject&&g.documentElement.doScroll){try{ac=!R.frameElement
}catch(ab){}if(ac){ad()
}}k(g,"DOMContentLoaded",ae);
k(g,"readystatechange",ae);
k(R,"load",ae)
}}Y.showIfVisible=function(x,ab){if(typeof ab=="undefined"){ab=D({img:x},H,"img")
}if(ab===-1){ab=H.push({img:x})-1
}if(B(g.documentElement,x)&&x.getBoundingClientRect().top<b+N&&s()){x.onload=null;
x.removeAttribute("onload");
x.onerror=null;
x.removeAttribute("onerror");
var ac=n(x,true);
if(ac!==null){x.src=ac.src;
if(!x.complete){H[ab].size=ac.size;
H[ab].start=+new Date;
H[ab].timer=setTimeout(function(){H[ab].expired=true
},7*1000);
x.onload=function(){if(!H[ab].size){return
}H[ab].end=+new Date;
clearTimeout(H[ab].timer);
var ae=(H[ab].end-H[ab].start)/1000,ad=(H[ab].size/ae).toFixed(2);
if(isFinite(ad)){if(l.length>E-1){l.shift()
}l.push(ad);
o()
}}
}}if(!x.getAttribute(M)){x.removeAttribute(O);
x.removeAttribute(h)
}if(F&&F.backgroundsize){x.parentNode.style.backgroundImage="url("+x.src+")"
}x.parentNode.setAttribute(Q,x.getAttribute(Q));
x.parentNode.setAttribute(r,"");
if(v){z(x,I,Q)
}x.setAttribute("data-lazy-loaded","true");
H[ab].complete=true;
return true
}else{return false
}};
function c(){if(Z){return R.JSON?R.JSON.parse(sessionStorage.getItem(S)||"[]"):[]
}else{return R.JSON?R.JSON.parse(localStorage.getItem(S)||"[]"):[]
}}function o(){if(Z){sessionStorage.setItem(S,R.JSON.stringify(l))
}else{localStorage.setItem(S,R.JSON.stringify(l))
}}function C(){var ab=0;
for(var x=0;
x<l.length;
x++){ab+=parseFloat(l[x])
}if(l.length===E){return(ab/l.length).toFixed(2)>G
}return true
}function P(){if(g.documentElement.clientHeight>=0){return g.documentElement.clientHeight
}else{if(g.body&&g.body.clientHeight>=0){return g.body.clientHeight
}else{if(R.innerHeight>=0){return R.innerHeight
}else{return 0
}}}}function d(){b=P()
}function L(){var x=H.length,ac,ad=true;
v=!!g.querySelector("["+I+"]");
for(ac=0;
ac<x;
ac++){var ab=H[ac];
if(ab!==null&&ab.complete!==true&&!Y.showIfVisible(ab.img,ac)){ad=false
}}if(ad&&q){j()
}}function j(){t=true;
a(R,"resize",W);
a(R,"resize",y);
a(R,"scroll",y);
a(R,"touchstart",y);
a(R,"load",U);
console.log("lzdz unsubscribed")
}function m(){t=false;
k(R,"resize",W);
k(R,"resize",y);
k(R,"scroll",y);
k(R,"touchstart",y);
console.log("lzdz subscribed")
}function s(){var x=typeof R.navigator.onLine==="boolean"?R.navigator.onLine:true;
return !!x
}function n(ac,ad){if(!!ac.getAttribute(h)){var ah=e(ac),ae=ac.getAttribute(u),x=R.location.search.indexOf("debug")>-1?1:C()?1:0.5,af=parseInt(ac.getAttribute("width")),ai=!!ac.src.match(/.*\.svg$/),ag=typeof(ac.offsetWidth)!=="undefined"?Math.floor(ac.offsetWidth*tmg.viewport.dpr):tmg.getViewportWidth(),ad=typeof(ad)!=="undefined"?ad:false;
if((ai&&F&&F.svg)||(af!=NaN&&af>=ag)){return null
}if(ae!=null&&ae!=""&&ae){ag=typeof(ac.parentNode.offsetWidth)!=="undefined"?Math.floor(ac.parentNode.offsetWidth*tmg.viewport.dpr):tmg.getViewportWidth()
}if(ah){for(var ab=0;
ab<ah.length;
ab++){if(parseInt(ah[ab].width)>=(ag*x)){return ad?ah[ab]:ah[ab].src
}}return ad?ah[ah.length-1]:ah[ah.length-1].src
}}return null
}function e(x){return x.getAttribute(h)?(R.JSON?JSON.parse(x.getAttribute(h).replace(/'/g,'"')).sort(i):[]):[]
}function i(ab,ac){return ab.width-ac.width
}function J(){var x=HTMLImageElement.prototype.getAttribute;
HTMLImageElement.prototype.getAttribute=function(ab){if(ab==="src"){return n(this)||x.call(this,O)||x.call(this,ab)
}else{return x.call(this,ab)
}}
}var B=g.documentElement.compareDocumentPosition?function(ab,x){return !!(ab.compareDocumentPosition(x)&16)
}:g.documentElement.contains?function(ab,x){return ab!==x&&(ab.contains?ab.contains(x):false)
}:function(ab,x){while((x=x.parentNode)){if(x===ab){return true
}}return false
};
function X(ac,ad,ab){var x;
if(ad){if(Array.prototype.indexOf){return Array.prototype.indexOf.call(ad,ac,ab)
}x=ad.length;
ab=ab?ab<0?Math.max(0,x+ab):ab:0;
for(;
ab<x;
ab++){if(ab in ad&&ad[ab]===ac){return ab
}}}return -1
}function D(ab,ad,ac){for(var x=0;
x<ad.length;
x++){if(ad[x][ac]===ab[ac]){return x
}}return -1
}function z(ac,ae,x){var ad=ac.getAttribute(x),ab;
while(ac.parentNode&&ac.parentNode.getAttribute){ac=ac.parentNode;
if(ac.getAttribute(ae)!==null){ab=ac.getAttribute(x);
if(ab){ad=ab+","+ad
}ac.setAttribute(x,ad);
break
}}}return Y
}(this,document,"requestAnimationFrame","cancelAnimationFrame",this.Modernizr)
};