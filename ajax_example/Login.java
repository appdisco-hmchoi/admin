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
		//req.setCharacterEncoding("KSC5601");	// ��Ĺ���� �ѱ� ���� ������ �ذ� �ϱ� ���� Encoding �� KSC5601�� ��ȯ �Ѵ�.
		//res.setContentType("text/html;charset=KSC5601");
		
		task = req.getParameter("task");
		forward = task;
		
		if(task == null || task.equals("userLogin"))	// �������� �α��� ���.
		{
			userLogin(req);
		}
		else if(task == null || task.equals("idChk"))	// ȸ�� ���� ���������� id �ߺ� üũ�� ���.
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
	 * �������� ȸ���� �α��� ��Ų��.
	 */
	public void userLogin(HttpServletRequest req) throws Exception
	{
		System.out.println(" �������� ȸ�� �α��� ");
	}
	
	/*
	 * userIn ���� ����ڰ� �Է��� id ���� �޾� DB�� �̹� ��� �Ǿ��� id�� �ִ��� üũ �Ѵ�.
	 */
	public String idChk(HttpServletRequest req) throws Exception
	{
		// jsp form ���� �Ѿ�� ���� ���� �´�.
		id = req.getParameter("id");
		System.out.println(" id ==============>> " + id);
		
		// ����Ŭ ����̹� �ε�
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
		 * ������ id�� �ִ��� Ȯ���ϰ� ���� ��� �α���, ���� ��� ȸ�� ���� �������� �̵� ��Ų��.
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
			return "idChkNo";	// ���� id�� �־�, ���� �Ҽ� ���� ���̵�.
		}
		else
		{
			return "idChkOk";	// ���� id �� ���, ������ ������ ���̵�.
		}
		
		//return "idChk";
	}
	
	/*
	 * �ű� ȸ���� ���� �Ѵ�.
	 */
	public String newUserIn(HttpServletRequest req) throws Exception
	{
		System.out.println(" �ű� ȸ�� ���� ");
		
		return "newUser";
		
		// ���� �� �̸� (id) �� ���� ��� db�� ��� �Ѵ�.
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
			System.out.println("��~");
		}
		*/
	}
}
