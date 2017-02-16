import HtmlBase from 'lego-starter-kit/ReactApp/Html'
import { Provider } from 'mobx-react'

require('./Html.global.css')

// export class Root extends HtmlBase.Root {
//   render() {
//     const stores = this.props.ctx.provider && this.props.ctx.provider.provide() || this.props.ctx.stores || {}
//     return <Provider { ...stores } >
//       {this.props.component}
//     </Provider>
//   }
// }

export default class Html extends HtmlBase {

  // static Root = Root;
  // renderStyle() {
  //   return `<style id="css"></style>`
  // }

  renderHead() {
    return `\
${super.renderHead()}
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src='http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>
<link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>
<link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'>
<link rel="stylesheet" href="https://npmcdn.com/react-bootstrap-table/dist/react-bootstrap-table-all.min.css">
`
  }

  renderFooter() {
    return `\
${super.renderFooter()}
`
  }

}
