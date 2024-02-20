const app = () => {
  const appendUserStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" href="{0}" data-mention-id="{1}" tabindex="-1" style="-webkit-user-modify: read-only;">@{2}</a>&nbsp;'
  const appendOrgStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" data-org-mention-id="{0}" data-mention-code="{1}" data-mention-icon="" data-mention-name="{2}" tabindex="-1" style="-webkit-user-modify: read-only;" href="#">@{2}</a>&nbsp;'

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
              lasteles.insertAdjacentHTML(
                'beforebegin',
                stringFormat(appendUserStringFormat, path, mentionid, username),
              )
              moveCursorToEnd(replyInputArea)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                divbr.insertAdjacentHTML('beforebegin', stringFormat(appendUserStringFormat, path, mentionid, username))
              } else {
                lasteles.insertAdjacentHTML(
                  'beforeend',
                  stringFormat(appendUserStringFormat, path, mentionid, username),
                )
              }
              moveCursorToEnd(replyInputArea)
            } else {
              replyInputArea.insertAdjacentHTML(
                'beforeend',
                stringFormat(appendUserStringFormat, path, mentionid, username),
              )
              moveCursorToEnd(replyInputArea)
            }
          } else {
            replyInputArea.insertAdjacentHTML(
              'beforeend',
              stringFormat(appendUserStringFormat, path, mentionid, username),
            )
            moveCursorToEnd(replyInputArea)
          }
        }
      })
      finduserhref[i].parentNode?.appendChild(ata)
    }
  }

  function makeMentionMarkForOrgSelect(os: OrgSelectFiledCode[]) {
    os.forEach((orgSelectElement) => {
      const userSelectTitleElement = orgSelectElement?.element?.previousElementSibling
      const mentionMarka = document.createElement('a')
      mentionMarka.style.marginLeft = '5px'
      mentionMarka.innerText = '@All'
      mentionMarka.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild
          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              addBatchMentionForOrg(lasteles, 'beforebegin', orgSelectElement)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                addBatchMentionForOrg(divbr, 'beforebegin', orgSelectElement)
              } else {
                addBatchMentionForOrg(lasteles, 'beforeend', orgSelectElement)
              }
            } else {
              addBatchMentionForOrg(replyInputArea, 'beforeend', orgSelectElement)
            }
          } else {
            addBatchMentionForOrg(replyInputArea, 'beforeend', orgSelectElement)
          }
          moveCursorToEnd(replyInputArea)
        }
      })
      userSelectTitleElement?.appendChild(mentionMarka)
    })
  }

  function makeMentionMarkForUserSelect(us: UserSelectFiledCodes) {
    us.forEach((userSelectElement) => {
      const userSelectTitleElement = userSelectElement?.element?.previousElementSibling
      const mentionMarka = document.createElement('a')
      mentionMarka.style.marginLeft = '5px'
      mentionMarka.innerText = '@All'
      mentionMarka.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild
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
      })
      userSelectTitleElement?.appendChild(mentionMarka)
    })
  }

  // todo 这里定义的userinfo信息和value有点重复，应该像org那样，加一个mentionid，这样code name id都有了，以后改进
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
        // Todo 这里是根据图片的src来获取mentionid，但对 Administator 这个用户来说，他的图片是默认的，没有mentionid，所以这里会得到null，id是null，回复就会报错，所以最好是根据code来获取id，将来需要改进
        const mentionid = photosrc.searchParams.get('id')
        const username = allUsersInBlock[i].children[1].textContent
        item.userinfo.push({ path: path, mentionid: mentionid, username: username })
      }
      item.element = element
      return item
    })
    return rt
  }

  type OrgSelectFiledCode = {
    fieldcode: string
    value: { id?: string; code: string; name: string }[]
    element?: HTMLElement
  }
  async function getOrgSelectElementByFieldType(record: any) {
    const pre: OrgSelectFiledCode[] = []
    for (const key in record) {
      if (record[key] && typeof record[key] === 'object') {
        // console.log(record[key])
        if (record[key].type === 'ORGANIZATION_SELECT') {
          pre.push({ fieldcode: key, value: record[key].value })
        }
      }
    }
    const rt = await Promise.all(
      pre.map(async (item) => {
        // console.log('item1', item)
        const element = kintone.app.record.getFieldElement(item.fieldcode) as HTMLElement
        item.element = element
        // initialize the id for each org
        // loop value
        item.value = await Promise.all(
          item.value.map(async (v) => {
            v.id = await getOrgIdbyCode(v.code)
            return v
          }),
        )
        // console.log('item2', item)
        return item
      }),
    )
    // console.log('rt', rt)

    return rt
  }

  function addBatchMention(lasteles: Element, position: InsertPosition, usf: any) {
    for (let item of usf) {
      lasteles.insertAdjacentHTML(
        position,
        stringFormat(appendUserStringFormat, item.path, item.mentionid, item.username),
      )
    }
  }

  function addBatchMentionForOrg(lasteles: Element, position: InsertPosition, orgs: OrgSelectFiledCode) {
    for (let item of orgs.value) {
      lasteles.insertAdjacentHTML(position, stringFormat(appendOrgStringFormat, item.id, item.code, item.name))
    }
  }

  async function getOrgIdbyCode(code: string) {
    const myHeaders = new Headers()
    myHeaders.append('X-Requested-With', kintone.getRequestToken())
    myHeaders.append('Content-Type', 'text/plain')
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow' as RequestRedirect, // Update the type of redirect property
    }
    try {
      const response = await fetch(`/v1/organizations.json?codes[0]=${code}`, requestOptions)
      const result = await response.json()
      if (result.organizations.length === 0) {
        throw new Error('No organization found')
      }
      return result.organizations[0].id
    } catch (error) {
      return ''
    }
  }

  kintone.events.on('app.record.detail.show', async function (event) {
    console.log('monkey jumping on detail.')
    init()
    // org select processing
    const os = await getOrgSelectElementByFieldType(event.record)
    console.log('orginfo', os)
    makeMentionMarkForOrgSelect(os)
    // multiple user select processing
    const us = getUserSelectElementByFieldType(event.record)
    console.log('userinfo', us)
    makeMentionMarkForUserSelect(us)
    // find all user mention and make mark
    makeAllUserMentionMark('@')
    return event
  })
}

export default app
