/* ============================================================
   Работы для галереи на главной (секция #works).

   Пока реальных фото нет — каждая карточка рисуется кодом
   (та же «рука», что в конструкторе) по полям shape/color/finish.
   Когда появятся фото: положите файл в assets/img/works/<имя>.jpg
   и добавьте поле img — карточка покажет фото вместо рисунка.
   Кнопка «Примерить» всегда грузит shape/color/finish в конструктор,
   поэтому заполняйте их близко к работе на фото.

   shape:  almond | oval | squoval | square | ballerina
   finish: gloss | matte | french | chrome | cat | glitter
   color:  любой HEX (лучше из палитры конструктора в main.js → COLORS)
   ============================================================ */
window.RN_WORKS = [
  { name:'Нюд-миндаль',        tag:'Гель-лак · глянец',     shape:'almond',    color:'#F2D4CB', finish:'gloss' },
  { name:'Классический френч', tag:'Френч · овал',          shape:'oval',      color:'#F4F1EC', finish:'french' },
  { name:'Ягодный глянец',     tag:'Гель-лак · мягкий квадрат', shape:'squoval', color:'#8E2F4D', finish:'gloss' },
  { name:'Жемчужный хром',     tag:'Втирка · миндаль',      shape:'almond',    color:'#F4F1EC', finish:'chrome' },
  { name:'Кошачий глаз',       tag:'Магнитный гель-лак',    shape:'oval',      color:'#5A1428', finish:'cat' },
  { name:'Бархатный мокко',    tag:'Матовый топ · квадрат', shape:'square',    color:'#9C6B57', finish:'matte' },
  { name:'Праздничное золото', tag:'Блёстки · балерина',    shape:'ballerina', color:'#E0B44C', finish:'glitter' },
  { name:'Красная классика',   tag:'Гель-лак · глянец',     shape:'squoval',   color:'#C8102E', finish:'gloss' }
];
