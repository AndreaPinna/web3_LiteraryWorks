pragma solidity ^0.5.0;

import "./ERC721.sol";

contract LiteraryWorks is ERC721{
    
    struct Composition{
        
        string title;
        string text;
        uint256 votes;
        bool seal;
        mapping(address => bool) _haveVoted;
        
    }
    
    struct Ownership{
        
        uint256[] _compositionList;
        
    }
    
    mapping(uint256 => Composition) _composition;
    mapping(address => Ownership) _ownerships;
    
    
    uint32 newPaperCost = 0.00 ether;
    uint256 lastid=0;
    
    modifier onlyOwnerOf(uint256 id) {
        require(msg.sender==ownerOf(id),"only the owner can write");
        _;
    }
    
    modifier notSealed(uint256 id){
        require(!_composition[id].seal,"the composition is sealed");
        _;
    }
    

    function createCard() public payable  returns( uint256) {
    
        lastid=lastid+1;
        _mint(msg.sender,lastid);
        _ownerships[msg.sender]._compositionList.push(lastid);
        return lastid;
        
    }   
    
    function writeText(string memory text,uint256 id) public onlyOwnerOf(id) notSealed(id) {
        _composition[id].text = text;
        _composition[id].votes = 0;
        
    }
    
    function writeTitle(string memory text,uint256 id) public onlyOwnerOf(id) notSealed(id) {
        _composition[id].title = text;
        _composition[id].votes = 0;
        
    }
    
    function publish(uint256 id) public onlyOwnerOf(id) {
        require(bytes(_composition[id].title).length > 0 &&  bytes(_composition[id].text).length>0, "Write title and text before publishing" );
        _composition[id].seal = true;
    }
    

    
    function vote(uint256 id) public  {
        require(!_composition[id]._haveVoted[msg.sender],"You've already voted");
        require(_composition[id].seal,"The composition is not published");
        _composition[id].votes++;
        _composition[id]._haveVoted[msg.sender]=true;
    }
    
    
    function getText(uint256 id) public view returns(string memory text) {
        return(_composition[id].text);
    }
    
        
    function getTitle(uint256 id) public view returns(string memory title) {
        return(_composition[id].title);
    }
    
    function getVotes(uint256 id) public view returns(uint256 votes ) {
        return(_composition[id].votes);
    }
    
    function getIsPublished(uint256 id) public view returns(bool isPublished){
        return(_composition[id].seal);
    }
    
    function getMyCompositions() public view returns(uint256[] memory compositionList){
        return(_ownerships[msg.sender]._compositionList);
    }
    
    function getNumberOfCompositions() public view returns(uint256 numberOfCompositions){
        return(lastid);
    }

}
    
