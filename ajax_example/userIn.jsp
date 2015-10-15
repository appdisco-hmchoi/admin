<%@ page language="java" contentType="text/html; charset=EUC-KR" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR">
		<title>회원 가입 페이지 입니다.</title>
		<script type="text/javascript" src="../css/prototype.js"></script>
		<script type="text/javascript">
		<!--
			/*
			*	DB에 현재 입력 된 ID가 존재 하는 비교 한다.
			*/
			function idChk()
			{
				var vForm = document.vForm;
				var id = vForm.id.value;
				 
				if(id == "")
				{
					alert("사용하실 아이디를 입력 후 ID 중복 체크를 하십시오.");
					vForm.id.focus();
					return;
				}
				
				var url = "../login.do?task=idChk";
				var myAjax = new Ajax.Request(url,
							{	
								method: 'post', 
								parameters: Form.serialize('vForm'),
								onComplete: callbacka
							}
						);
			}
				
			function callbacka(originalRequest)
			{
				var forward = originalRequest.responseText;
				
				// 이미 존재하는 id 라 가입이 불가능한 아이디일 경우.
				if( forward == "idChkNo" )
				{
					$('type1').style.display = 'none';
					$('type2').style.display = '';
					//alert("이미 존재하는 아이디 입니다.");
				}
				else	// idChkOk 가 넘어올 경우 가입이 가능한 아이디.
				{
					$('type1').style.display = '';
					$('type2').style.display = 'none';
					//alert("사용이 가능한 아이디 입니다.");
				}
			}
			
			/*
			*	회원 가입
			*/
			function userInner()
			{
				var vForm = document.vForm;
				
				vForm.task.value = "newUser";
				vForm.method = "post";
				vForm.action = "../login.do";
				vForm.submit();
			}
			
			/*
			*	회원 가입 취소
			*/
			function reset()
			{
				var vForm = document.vForm;
				
				chked = confirm("회원 가입을 취소 하시겠습니까?");
				
				if(chked == true)	// 사용자가 가입 취소를 할 경우 모든 폼의 내용을 비운다.
				{
					vForm.id.value = "";
					vForm.name.value = "";
					vForm.jumin1.value = "";
					vForm.jumin2.value = "";
					vForm.address.value = "";
					vForm.email.value = "";
					vForm.num1.value = "";
					vForm.num2.value = "";
					vForm.num3.value = "";
				}
			}
		-->
		</script>
	</head>
	<body>
		<h3>회원 가입이 필요 합니다.</h3><hr><p>
		<!-- <form name="vForm" style="margin: 0; padding: 0"> -->
		<form name="vForm" method="post" action="/login/login.do" style="margin: 0; padding: 0">
		<input type="hidden" name="task">
		<table width="600" border="0" cellpadding="0" cellspacing="0">
			<tr>
				<td colspan="3" align="center"><h3>회원 가입</h3></td>
			</tr>
			<tr style="background-color: #e4eefe">
				<td height="30" width="120"><font color="red">*</font> ID :</td>
				<td width="250"><input type="text" name="id">&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:idChk()">ID 중복 체크</a></td>
				<td><div id="type1" style="display: none"><font color='red'>★</font> 사용 가능한 아이디 입니다.</div><div id="type2" style="display: none"><font color='red'>★</font> 이미 존재하는 아이디 입니다.</div></td>
			</tr>
			<tr>
				<td height="30"><font color="red">*</font> 이름 :</td>
				<td colspan="2"><input type="text" name="name"></td>
			</tr>
			<tr style="background-color: #e4eefe">
				<td height="30"><font color="red">*</font> 주민등록번호 :</td>
				<td colspan="2"><input type="text" name="jumin1"> ~ <input type="password" name="jumin2"></td>
			</tr>
			<tr>
				<td height="30">&nbsp;&nbsp;주소 :</td>
				<td colspan="2"><input type="text" name="address" size="43"></td>
			</tr>
			<tr style="background-color: #e4eefe">
				<td height="30"><font color="red">*</font> email :</td>
				<td colspan="2"><input type="text" name="email" size="15">&nbsp;@&nbsp;<input type="text" name="email2" size="15"></td>
			</tr>
			<tr>
				<td height="30"><font color="red">*</font> 연락처 :</td>
				<td colspan="2"><input type="text" name="num1" size="5">&nbsp;-&nbsp;<input type="text" name="num2" size="11">&nbsp;-&nbsp;<input type="text" name="num3" size="11"></td>
			</tr>
			<tr style="background-color: #e4eefe" align="center">
				<td colspan="3" height="60"><a href="javascript:userInner()">회원가입</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:reset()">취소</a></td>
			</tr>
		</table>
		</form>
		</body>
</html>