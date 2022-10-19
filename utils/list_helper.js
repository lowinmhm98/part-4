const dummy = (blogs) => {
    // ...

    return 1
  }

const totalLikes =(blogs)=>{
  if (!blogs.length) {
      return 0
    } else {
      let result=  blogs.reduce((sum,blog)=>{
            sum+=blog.likes
            return sum;
        },0)
        return result
    }
}

const favoriteBlog =(blogs)=>{
    if (!blogs.length) {
        return "list doesn't have blogs"
      } else {
        let result=  blogs.reduce((prev,curr)=>{
              if (curr.likes >=prev.likes) {
                return curr
              } else {
                return  prev
              }
          })
          console.log(result);
          return result
      }
  }
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }