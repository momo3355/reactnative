package wcms.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;



public class Board implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private String name;
	private String title;
	private String password;	
	private String content;
    private List<MultipartFile> files;





	private int user;
	
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	 public List<MultipartFile> getFiles() {
		  return files;
		 }

		 public void setFiles(List<MultipartFile> files) {
		  this.files = files;
		 }

	public int getUser() {
		return user;
	}

	public void setUser(int user) {
		this.user = user;
	}

}
