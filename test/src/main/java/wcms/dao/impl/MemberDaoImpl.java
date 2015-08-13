package wcms.dao.impl;



import wcms.dao.MemberDao;

import wcms.model.Member;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;




@Repository
public class MemberDaoImpl  implements MemberDao {

	
	@Autowired
	public SqlMapClientTemplate sqlMapClientTemplate;
	
	
	@Transactional
	public void  insertMember(Member member) {
		sqlMapClientTemplate.insert("insertMember", member);	
	}
	
	
	@Transactional	
	public Member SelectMember(Member member) {
		System.out.println(member.getId());
		member =  (Member)sqlMapClientTemplate.queryForObject("SelectMember", member);
		return member;
	
	}
	

	
}

