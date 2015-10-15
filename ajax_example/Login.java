package login;

import java.io.*;
import java.sql.*;
import javax.servlet.http.*;
import org.apache.struts.action.*;

public class Login extends Action
{
	private String task, id, url, sql, conId = "art09", conPasswd = "104748!@";
	private boolean id_chk;
	private String forward = "";
	
	public ActionForward execute(ActionMapping map, ActionForm form, HttpServletRequest req, HttpServletResponse res) throws Exception
	{
		//req.setCharacterEncoding("KSC5601");	// 톰캣에서 한글 깨짐 현상을 해결 하기 위해 Encoding 을 KSC5601로 변환 한다.
		//res.setContentType("text/html;charset=KSC5601");
		
		task = req.getParameter("task");
		forward = task;
		
		if(task == null || task.equals("userLogin"))	// 정상적인 로그인 경우.
		{
			userLogin(req);
		}
		else if(task == null || task.equals("idChk"))	// 회원 가입 페이지에서 id 중복 체크일 경우.
		{
			forward = idChk(req);
			
			res.setContentType("text/xml;charset=EUC-KR");
			res.setHeader("Cache-Control", "no-cache");
			res.getWriter().write(forward);
			
			forward="";
		}
		else if(task == null || task.equals("newUser"))
		{
			newUserIn(req);
		}
		
		System.out.println("forward =====> " + forward);
		return map.findForward(forward);
	}
	
	/*
	 * 정상적인 회원을 로그인 시킨다.
	 */
	public void userLogin(HttpServletRequest req) throws Exception
	{
		System.out.println(" 정상적인 회원 로그인 ");
	}
	
	/*
	 * userIn 에서 사용자가 입력한 id 값을 받아 DB에 이미 등록 되어진 id가 있는지 체크 한다.
	 */
	public String idChk(HttpServletRequest req) throws Exception
	{
		// jsp form 에서 넘어온 값을 가져 온다.
		id = req.getParameter("id");
		System.out.println(" id ==============>> " + id);
		
		// 오라클 드라이버 로드
		try
		{
			url = "jdbc:oracle:thin:@localhost:1521:XE";
			Class.forName("oracle.jdbc.driver.OracleDriver");
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
		
		/*
		 * 동일한 id가 있는지 확인하고 있을 경우 로그인, 없을 경우 회원 가입 페이지로 이동 시킨다.
		 */
		try
		{
			Connection con = DriverManager.getConnection(url, conId, conPasswd);
			sql = "select name from book where name = ?";
			
			PreparedStatement st = con.prepareStatement(sql);
			st.setString(1, id);
			
			ResultSet rs = null;
			rs = st.executeQuery();
			id_chk = rs.next();
		}
		catch(Exception e)
		{
			e.printStackTrace();
		}
		
		System.out.println(" id_chk ==> " + id_chk);
		
		if( id_chk == true )
		{
			return "idChkNo";	// 동일 id가 있어, 가입 할수 없는 아이디.
		}
		else
		{
			return "idChkOk";	// 동일 id 가 없어서, 가입이 가능한 아이디.
		}
		
		//return "idChk";
	}
	
	/*
	 * 신규 회원을 가입 한다.
	 */
	public String newUserIn(HttpServletRequest req) throws Exception
	{
		System.out.println(" 신규 회원 가입 ");
		
		return "newUser";
		
		// 동일 한 이름 (id) 가 없을 경우 db에 등록 한다.
		/*
		if(id_chk != true)
		{
			Connection con = DriverManager.getConnection(url, conId, conPasswd);
			
			sql = "insert into book(name, password, address, email)" + "values(?,?,?,?)";
			PreparedStatement st = con.prepareStatement(sql);
			
			st.setString(1, id);
			st.setString(2, password);
			
			st.executeUpdate();
			st.close();
			con.close();
		}
		else
		{
			System.out.println("즐~");
		}
		*/
	}
}
