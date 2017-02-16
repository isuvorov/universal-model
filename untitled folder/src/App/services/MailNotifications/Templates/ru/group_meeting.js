import moment from 'moment'
export default (ctx, emailParams = {}) => {
  const data = {
    event: {
      name: '',
      date: '',
      image: '',
      place: {
        name: '',
      },
    },
  }
  if (emailParams && emailParams.event) {
    data.event.title = emailParams.event.title
    data.event.image = emailParams.event.coverImage
    data.event.date = moment(data.event.startDate)
    .locale(emailParams._profile.nativeLanguage || 'en')
    .format('LL [в] LT')
    .replace('г. ', '')
    if (emailParams.event.place) {
      data.event.place.name = emailParams.event.place.name
    }
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="Keywords" content="hi jay, mobile application, learning of foreign languages, how to find the foreigner, to meet the foreigner, studying of English with a native speakers free" >
    <meta name="Description" content=""Hi, Jay!" is an awesome mobile app for search and organization meetings with native speakers!" >
    <title></title>
</head>

<style>
body {background:#dfe8ef;margin:0px; padding:0px;font-family: open sans, Verdana;color:#494949; font-size: 18px;}
.mail {background:#fff; margin:0px auto; width:800px;display:block; height:100%;}
h1 {padding:0px 0px 45px 0px; margin:0px;line-height:1;font-size: 28px;}
h2 {padding:30px 0px 0px 0px; margin:0px;line-height:1;font-size: 18px;}
ol li {font-size:14px;}
p {margin:0px; padding:0px 0px 20px 0px;}
.content {padding: 45px 90px 0px 90px;}
.lines div {float:left;width:20%;height:3px;display:block;}
.lines div:nth-child(1) {background:#064f5c;}
.lines div:nth-child(2) {background:#273960;}
.lines div:nth-child(3) {background:#04a8c6;}
.lines div:nth-child(4) {background:#cd6637;}
.lines div:nth-child(5) {background:#e93f33;}
.header {height: 80px;background: url('logo.png') 25px 19px no-repeat; background-size: 52px;line-height:80px;padding: 0px 0px 0px 90px;border-bottom: 2px solid #e6e6e8;font-size: 16px;}
.social {display:block; text-align:center; margin: 20px 0px 40px 0px;}
.social div:nth-child(1) {font-size:22px; color:#04a8c6;line-height:1.3;}
.social ul {margin:0px; padding:30px;}
.social ul li {list-style-type:none;}
.fb a {background: url('${ctx.htmlStaticPath}fb.png') no-repeat;float:right;}
.vk a {background: url('${ctx.htmlStaticPath}vk.png') no-repeat;float:left;}
.fb, .vk {width:50%; float:left;}
.fb a, .vk a {background-size:35px; height:35px; width:35px;margin: 0px 20px;}
.social_footer {position: absolute;right: 0;}
.social_footer div:nth-child(1) {font-size:22px; color:#04a8c6;line-height:1.3;}
.social_footer ul {margin: 40px 20px 20px 0px; padding:0px;}
.social_footer ul li {list-style-type:none;}
.social_footer ul .fb a, .social_footer ul .vk a {background-size:35px; height:35px; width:35px;margin: 0px 0px 0px 20px;}
.footer1 {position:relative;font-size: 12px;background-color: #f8f8f8;padding:20px;}
a {color:#e77e31;}
a:hover {text-decoration:none;}
div.jays {position:relative;}
div.jay {position:relative;}
div.jay:first-child {margin-bottom:20px; margin-top:0px!important;}
div.jay:last-child {margin-top: 20px;margin-bottom:30px;}
img.flag {position:absolute; width:30px; height:30px;z-index:9999;top: 10px;left: 5px;}
img.jay {
  -webkit-mask-box-image: url("mask_logo.svg") 0 stretch;
  mask-border: url("mask_logo.svg") 0 stretch;
  width:100px;
  height:100px;
  margin: 0px 20px 0px 20px;
}
.avatar {float:left;}
.meeting {float:left;line-height:1.5;height:105px; padding:20px 0px 0px 0px;}
.meeting div b {color:#e77e31; font-weight:bold;}
.meeting .place {background: url('${ctx.htmlStaticPath}place.png') 1px 7px no-repeat; background-size:9px; padding:0px 0px 0px 20px;}
.meeting .time {background: url('${ctx.htmlStaticPath}time.png') 1px 9px no-repeat; background-size:10px; padding:0px 0px 0px 20px;}
.i {padding:5px 0px 0px 0px;}
.clear {clear:both;}

.content ul.downloads {margin: 40px 0px 30px 0px; padding:0px; height:60px;}
.content ul.downloads li {list-style-type:none;}
.appstore a {background: url('${ctx.htmlStaticPath}appstore.png') no-repeat;float:right;}
.playstore a {background: url('${ctx.htmlStaticPath}playstore.png') no-repeat;float:left;}
.appstore, .playstore {width:50%; float:left;}
.appstore a, .playstore a {background-size:150px; height:49px; width:149px;margin: 0px 20px;}
.unsibscribe {text-decoration:underline; color:#949494;}
</style>

<body>
	<div class="mail">
		<div class="lines">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
		<div class="body_mail">
			<div class="header">Привет, Джей!</div>
			<div class="content">
				<h1>В скором времени рядом с тобой пройдут групповые встречи на языках,которые ты изучаешь. <br><br>Присоединяйся!</h1>
				<div class="jays">
					<div class="jay">
						<div class="avatar">
							<img src="${ctx.htmlStaticPath}flag.png" class="flag">
							<img src="${data.event.image}"> class="jay">
						</div>
						<div class="meeting i">
								<div><b>${data.event.name}</b></div>
								<div class="place">${data.event.place.name}</div>
								<div class="time">${data.event.date}</div>
						</div>
						<div class="clear"></div>
					</div>
					<div>
						<h2>Что сделать, чтобы присоединиться к групповой встрече?</h2>
						<ol>
							<li>Открой приложение «Hi, Jay!»
							<li>Перейди в раздел “Встречи”
							<li>Перейди в профиль нужной групповой встречи
						</ol>
					</div>
				</div>
				<ul class="downloads">
					<li class="appstore"><a href="https://vk.com/away.php?to=https%3A%2F%2Fitunes.apple.com%2Fru%2Fapp%2Fhi-jay%21-nositeli-azyka-radom%21%2Fid1071097131%3Fmt%3D8&post=-98739706_203" target="_blank"></a>
					<li class="playstore"><a href="https://vk.com/away.php?to=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.hijay.hijay&post=-98739706_203" target="_blank"></a>
				</ul>
				<div class="footer1">
					<div class="social_footer">
						<ul>
							<li class="fb"><a href="https://www.facebook.com/hijayapp/" target="_blank"></a>
							<li class="vk"><a href="https://vk.com/hijayapp" target="_blank"></a>
						</ul>
					</div>
					<p>Напиши на <a href="mailto:support@hi-jay.eu">support@hi-jay.eu</a>, если у тебя возникли проблемы с использованием «Hi, Jay!», мы обязательно тебе поможем.
					<p>С уважением, команда «Hi, Jay!».
					<p><a href="http://www.hi-jay.eu" target="_blank">www.hi-jay.eu</a>
					<p class="unsibscribe">Чтобы отказаться от этой рассылки, перейдите в приложение в раздел "Мой профиль".
				</div>
			</div>
		</div>
		<div class="lines">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>
</body>
</html>`
}
