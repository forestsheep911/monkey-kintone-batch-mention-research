const app = () => {
  console.log('monkey jumping on the bed.')
  const appendStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" href="{0}" data-mention-id="{1}" tabindex="-1" style="-webkit-user-modify: read-only;">@{2}</a>&nbsp;'

  let isNoti = false
  let replyBox: undefined | HTMLElement = undefined

  function init() {
    isNoti =
      document.querySelector('iframe') &&
      document.querySelector('iframe')?.contentDocument?.querySelectorAll('.user-link-cybozu')
        ? true
        : false
    replyBox = isNoti
      ? (document
          .querySelector('iframe')
          ?.contentDocument?.querySelector('.ocean-ui-comments-commentform-textarea') as HTMLElement)
      : (document.querySelector('.ocean-ui-comments-commentform-textarea') as HTMLElement)
  }
  function stringFormat(src: string, ...args: any[]): string {
    if (arguments.length === 0) return ''
    return src.replace(/\{(\d+)\}/g, function (m, i) {
      return args[i]
    })
  }

  function placeCaretAtEnd(areaDom: HTMLElement): void {
    areaDom.focus()
    if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
      var range = document.createRange()
      range.selectNodeContents(areaDom)
      range.collapse(false)
      var sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  function atinject(atMarkString: string): void {
    const finduserhref = document.querySelectorAll('.user-link-cybozu')
    if (finduserhref.length != 0) {
      doloop(finduserhref, isNoti, atMarkString)
    }

    const myiframe = document.querySelector('iframe')
    if (myiframe) {
      const finduserhref = myiframe.contentDocument?.querySelectorAll('.user-link-cybozu')
      if (finduserhref) {
        doloop(finduserhref, isNoti, atMarkString)
      }
    }
  }

  function doloop(finduserhref: NodeListOf<Element>, isNoti: boolean, atMarkString: string): void {
    for (let i = 0; i < finduserhref.length; i++) {
      if (finduserhref[i].nextElementSibling) {
        continue
      }
      const newurl = new URL((<HTMLLinkElement>finduserhref[i]).href)
      const path = (<HTMLLinkElement>finduserhref[i]).href.substring(
        newurl.protocol.length + newurl.hostname.length + 2,
      )
      console.log(path)

      const photosrc = new URL((<HTMLImageElement>finduserhref[i].children[0]).src)
      const mentionid = photosrc.searchParams.get('id')
      console.log(mentionid)

      const username = finduserhref[i].children[1].textContent
      console.log(username)

      const ata = document.createElement('a')
      ata.style.marginLeft = '5px'
      ata.innerText = atMarkString
      ata.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        // const replyinputarea
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild
          console.log(lasteles)

          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              lasteles.insertAdjacentHTML('beforebegin', stringFormat(appendStringFormat, path, mentionid, username))
              placeCaretAtEnd(replyInputArea)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                divbr.insertAdjacentHTML('beforebegin', stringFormat(appendStringFormat, path, mentionid, username))
              } else {
                lasteles.insertAdjacentHTML('beforeend', stringFormat(appendStringFormat, path, mentionid, username))
              }
              placeCaretAtEnd(replyInputArea)
            } else {
              replyInputArea.insertAdjacentHTML(
                'beforeend',
                stringFormat(appendStringFormat, path, mentionid, username),
              )
              placeCaretAtEnd(replyInputArea)
            }
          } else {
            replyInputArea.insertAdjacentHTML('beforeend', stringFormat(appendStringFormat, path, mentionid, username))
            placeCaretAtEnd(replyInputArea)
          }
        }
      })
      finduserhref[i].parentNode?.appendChild(ata)
    }
  }

  type UserSelectFiledCodes = string[]
  function getUserSelectElementByFieldType(record: any) {
    const result: UserSelectFiledCodes = []
    for (const key in record) {
      if (record[key] && typeof record[key] === 'object') {
        console.log(record[key])
        if (record[key].type === 'USER_SELECT') {
          result.push(key)
        }
      }
    }
    return result
  }
  kintone.events.on('app.record.detail.show', function (event) {
    const us = getUserSelectElementByFieldType(event.record)
    console.log(us)
    const userSelectElements = us.map((key) => {
      return event.record[key].value
    })
    init()
    atinject('@')
    return event
  })
}

export default app
