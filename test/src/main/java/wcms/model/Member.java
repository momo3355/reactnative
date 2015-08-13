package wcms.model;

import java.io.Serializable;

public class Member implements Serializable {

	private static final long serialVersionUID = 1L;
	private String user;
	private String id;
	private String name;		
	private String pass;
	private String email;
	private String authority;
					


	
	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAuthority() {
		return authority;
	}

	public void setAuthority(String authority) {
		this.authority = authority;
	}

	@Override
	public String toString() {
		return "Member [id=" + id + ", password=" + pass + ", email="
				+ email + ", authority=" + authority + "]";
	}

}
