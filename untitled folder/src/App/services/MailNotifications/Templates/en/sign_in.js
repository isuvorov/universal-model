export default (ctx, emailParams = {}) => {
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
p {margin:0px; padding:0px 0px 20px 0px;}
.content {padding: 45px 90px 0px 90px;}
.lines div {float:left;width:20%;height:3px;display:block;}
.lines div:nth-child(1) {background:#064f5c;}
.lines div:nth-child(2) {background:#273960;}
.lines div:nth-child(3) {background:#04a8c6;}
.lines div:nth-child(4) {background:#cd6637;}
.lines div:nth-child(5) {background:#e93f33;}
.header {height: 80px;background: url('${ctx.htmlStaticPath}logo.png') 25px 19px no-repeat; background-size: 52px;line-height:80px;padding: 0px 0px 0px 90px;border-bottom: 2px solid #e6e6e8;font-size: 16px;}
.social {display:block; text-align:center; margin: 20px 0px 40px 0px;}
.social div:nth-child(1) {font-size:22px; color:#04a8c6;line-height:1.3;}
.social ul {margin:0px; padding:30px;}
.social ul li {list-style-type:none;}
.fb a {background: url('${ctx.htmlStaticPath}fb.png') no-repeat;float:right;}
.vk a {background: url('${ctx.htmlStaticPath}vk.png') no-repeat;float:left;}
.fb, .vk {width:50%; float:left;}
.fb a, .vk a {background-size:35px; height:35px; width:35px;margin: 0px 20px;}
.footer1 {font-size: 12px;background-color: #f8f8f8;padding:20px;}
a {color:#e77e31;}
a:hover {text-decoration:none;}
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
			<div class="header">Hi, Jay!</div>
			<div class="content">
				<h1>Welcome to the world community<br>of native speakers "Hi, Jay!".</h1>
				<p>Thank you for joining our international community. "Hi, Jay!" will help you to find native speakers all over the world so you can practice foreign languages any time and anywhere.
				<p><b>Your personal authorization data:</b>
				<br>Login: ${emailParams.login}
				<br>Password: ${emailParams.password}
				<div class="social">
					<div>Support our App,<br>share it with your friends.</div>
					<ul>
						<li class="fb"><a href="https://www.facebook.com/hijayapp/" target="_blank"></a>
						<li class="vk"><a href="https://vk.com/hijayapp" target="_blank"></a>
					</ul>
				</div>
				<div class="footer1">
					<p>If you like "Hi,Jay", please leave a pleasant comment about the App in AppStore or GooglePlay. It will help us so much!
					<p>Best wishes, "Hi,Jay" team.
					<p><a href="http://www.hi-jay.eu" target="_blank">www.hi-jay.eu</a>
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
