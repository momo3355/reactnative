package wcms.model;

import java.io.Serializable;
import java.util.Date;

public class Reply implements Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Integer no;
	private String memo;
	private Date wdate;
	private Integer ref_no;
	private String id;
	
	public Reply() {
		this.no = 0;
		this.memo = null;
		this.wdate = null;
		this.ref_no = 0;
		this.id = null;
	}
	
	public Reply(Integer no, String memo, Date wdate, Integer ref_no, String id) {
		super();
		this.no = no;
		this.memo = memo;
		this.wdate = wdate;
		this.ref_no = ref_no;
		this.id = id;
	}

	public Integer getNo() {
		return no;
	}

	public void setNo(Integer no) {
		this.no = no;
	}

	public String getMemo() {
		return memo;
	}

	public void setMemo(String memo) {
		this.memo = memo;
	}

	public Date getWdate() {
		return wdate;
	}

	public void setWdate(Date wdate) {
		this.wdate = wdate;
	}

	public Integer getRef_no() {
		return ref_no;
	}

	public void setRef_no(Integer ref_no) {
		this.ref_no = ref_no;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
}
