const app = () => {
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

  function moveCursorToEnd(area: HTMLElement): void {
    area.focus()
    if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
      var range = document.createRange()
      range.selectNodeContents(area)
      range.collapse(false)
      var sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  function makeAllUserMentionMark(atMarkString: string): void {
    const finduserhref = document.querySelectorAll('.user-link-cybozu')
    if (finduserhref.length != 0) {
      makeMentionMark(finduserhref, isNoti, atMarkString)
    }

    const myiframe = document.querySelector('iframe')
    if (myiframe) {
      const finduserhref = myiframe.contentDocument?.querySelectorAll('.user-link-cybozu')
      if (finduserhref) {
        makeMentionMark(finduserhref, isNoti, atMarkString)
      }
    }
  }

  function makeMentionMark(finduserhref: NodeListOf<Element>, isNoti: boolean, atMarkString: string): void {
    for (let i = 0; i < finduserhref.length; i++) {
      if (finduserhref[i].nextElementSibling) {
        continue
      }
      const newurl = new URL((<HTMLLinkElement>finduserhref[i]).href)
      const path = (<HTMLLinkElement>finduserhref[i]).href.substring(
        newurl.protocol.length + newurl.hostname.length + 2,
      )
      const photosrc = new URL((<HTMLImageElement>finduserhref[i].children[0]).src)
      const mentionid = photosrc.searchParams.get('id')

      const username = finduserhref[i].children[1].textContent

      const ata = document.createElement('a')
      ata.style.marginLeft = '5px'
      ata.innerText = atMarkString
      ata.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild

          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              lasteles.insertAdjacentHTML('beforebegin', stringFormat(appendStringFormat, path, mentionid, username))
              moveCursorToEnd(replyInputArea)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                divbr.insertAdjacentHTML('beforebegin', stringFormat(appendStringFormat, path, mentionid, username))
              } else {
                lasteles.insertAdjacentHTML('beforeend', stringFormat(appendStringFormat, path, mentionid, username))
              }
              moveCursorToEnd(replyInputArea)
            } else {
              replyInputArea.insertAdjacentHTML(
                'beforeend',
                stringFormat(appendStringFormat, path, mentionid, username),
              )
              moveCursorToEnd(replyInputArea)
            }
          } else {
            replyInputArea.insertAdjacentHTML('beforeend', stringFormat(appendStringFormat, path, mentionid, username))
            moveCursorToEnd(replyInputArea)
          }
        }
      })
      finduserhref[i].parentNode?.appendChild(ata)
    }
  }

  type UserSelectFiledCodes = { fieldcode: string; value: object; element?: HTMLElement; userinfo?: object[] }[]
  function getUserSelectElementByFieldType(record: any) {
    const pre: UserSelectFiledCodes = []
    for (const key in record) {
      if (record[key] && typeof record[key] === 'object') {
        // console.log(record[key])
        if (record[key].type === 'USER_SELECT') {
          pre.push({ fieldcode: key, value: record[key].value })
        }
      }
    }
    const rt = pre.map((item) => {
      const element = kintone.app.record.getFieldElement(item.fieldcode) as HTMLElement
      const allUsersInBlock = element.querySelectorAll('.user-link-cybozu')
      item.userinfo = [] // Initialize the userinfo array
      for (let i = 0; i < allUsersInBlock.length; i++) {
        if (allUsersInBlock[i].nextElementSibling) {
          continue
        }
        const newurl = new URL((<HTMLLinkElement>allUsersInBlock[i]).href)
        const path = (<HTMLLinkElement>allUsersInBlock[i]).href.substring(
          newurl.protocol.length + newurl.hostname.length + 2,
        )
        const photosrc = new URL((<HTMLImageElement>allUsersInBlock[i].children[0]).src)
        const mentionid = photosrc.searchParams.get('id')
        const username = allUsersInBlock[i].children[1].textContent
        item.userinfo.push({ path: path, mentionid: mentionid, username: username })
      }
      item.element = element
      return item
    })
    return rt
  }

  function addBatchMention(lasteles: Element, position: InsertPosition, usf: any) {
    // loop usf
    for (let item of usf) {
      lasteles.insertAdjacentHTML(position, stringFormat(appendStringFormat, item.path, item.mentionid, item.username))
    }
  }

  kintone.events.on('app.record.detail.show', function (event) {
    console.log('monkey jumping on detail.')
    init()
    // multiple user select processing
    const us = getUserSelectElementByFieldType(event.record)
    console.log(us)
    const userSelectTitleElement = us[0]?.element?.previousElementSibling
    const mentionMarka = document.createElement('a')
    mentionMarka.style.marginLeft = '5px'
    mentionMarka.innerText = '@'
    mentionMarka.addEventListener('click', function () {
      ;(replyBox as HTMLElement)?.focus()
      const replyInputArea = isNoti
        ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
        : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
      if (replyInputArea) {
        const lasteles = replyInputArea.lastElementChild
        for (let userSelectElement of us) {
          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              addBatchMention(lasteles, 'beforebegin', userSelectElement.userinfo)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                addBatchMention(divbr, 'beforebegin', userSelectElement.userinfo)
              } else {
                addBatchMention(lasteles, 'beforeend', userSelectElement.userinfo)
              }
            } else {
              addBatchMention(replyInputArea, 'beforeend', userSelectElement.userinfo)
            }
          } else {
            addBatchMention(replyInputArea, 'beforeend', userSelectElement.userinfo)
          }
          moveCursorToEnd(replyInputArea)
        }
      }
    })
    userSelectTitleElement?.appendChild(mentionMarka)
    makeAllUserMentionMark('@')
    return event
  })
}

export default app
