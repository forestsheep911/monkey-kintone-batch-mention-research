const app = () => {
  const appendUserStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" href="/k/#/people/user/{0}" data-mention-id="{1}" tabindex="-1" style="-webkit-user-modify: read-only;">@{2}</a>&nbsp;'
  const appendOrgStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" data-org-mention-id="{0}" data-mention-code="{1}" data-mention-icon="" data-mention-name="{2}" tabindex="-1" style="-webkit-user-modify: read-only;" href="#">@{2}</a>&nbsp;'
  const appendGroupStringFormat =
    '<a class="ocean-ui-plugin-mention-user ocean-ui-plugin-linkbubble-no" data-group-mention-id="{0}" data-mention-code="{1}" data-mention-icon data-mention-name="{2}" tabindex="-1" style="-webkit-user-modify: read-only;" href="#">@{2}</a>&nbsp;'

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
      const range = document.createRange()
      range.selectNodeContents(area)
      range.collapse(false)
      const sel = window.getSelection()
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

  function makeMentionMarkForOrgs(orgs: OrgSelectFiledInfo[]) {
    for (const org of orgs) {
      org.element?.querySelectorAll('li > span').forEach((orgElement) => {
        const mentionMarka = document.createElement('a')
        mentionMarka.style.marginLeft = '5px'
        mentionMarka.innerText = '@'
        let matchedValue: {
          id?: string | undefined
          code: string
          name: string
        }
        for (const item of org.value) {
          if (orgElement.textContent === item.name) {
            matchedValue = item
            break
          }
        }
        mentionMarka.addEventListener('click', function () {
          ;(replyBox as HTMLElement)?.focus()
          const replyInputArea = isNoti
            ? (document
                .querySelector('iframe')
                ?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
            : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
          if (replyInputArea) {
            const lasteles = replyInputArea.lastElementChild
            if (lasteles) {
              if (lasteles.nodeName === 'BR') {
                addMentionForOrg(lasteles, 'beforebegin', matchedValue)
              } else if (lasteles.nodeName === 'DIV') {
                const divbr = lasteles.lastElementChild
                if (divbr && divbr.nodeName === 'BR') {
                  addMentionForOrg(divbr, 'beforebegin', matchedValue)
                } else {
                  addMentionForOrg(lasteles, 'beforeend', matchedValue)
                }
              } else {
                addMentionForOrg(replyInputArea, 'beforeend', matchedValue)
              }
            } else {
              addMentionForOrg(replyInputArea, 'beforeend', matchedValue)
            }
            moveCursorToEnd(replyInputArea)
          }
        })
        orgElement?.appendChild(mentionMarka)
      })
    }
  }

  function makeMentionMarkForGroups(orgs: GroupSelectFiledInfo[]) {
    for (const org of orgs) {
      org.element?.querySelectorAll('li > span').forEach((orgElement) => {
        const mentionMarka = document.createElement('a')
        mentionMarka.style.marginLeft = '5px'
        mentionMarka.innerText = '@'
        let matchedValue: {
          id?: string | undefined
          code: string
          name: string
        }
        for (const item of org.value) {
          if (orgElement.textContent === item.name) {
            matchedValue = item
            break
          }
        }
        mentionMarka.addEventListener('click', function () {
          ;(replyBox as HTMLElement)?.focus()
          const replyInputArea = isNoti
            ? (document
                .querySelector('iframe')
                ?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
            : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
          if (replyInputArea) {
            const lasteles = replyInputArea.lastElementChild
            if (lasteles) {
              if (lasteles.nodeName === 'BR') {
                addMentionForGroup(lasteles, 'beforebegin', matchedValue)
              } else if (lasteles.nodeName === 'DIV') {
                const divbr = lasteles.lastElementChild
                if (divbr && divbr.nodeName === 'BR') {
                  addMentionForGroup(divbr, 'beforebegin', matchedValue)
                } else {
                  addMentionForGroup(lasteles, 'beforeend', matchedValue)
                }
              } else {
                addMentionForGroup(replyInputArea, 'beforeend', matchedValue)
              }
            } else {
              addMentionForGroup(replyInputArea, 'beforeend', matchedValue)
            }
            moveCursorToEnd(replyInputArea)
          }
        })
        orgElement?.appendChild(mentionMarka)
      })
    }
  }

  function makeMentionMarkForOrgSelect(orgs: OrgSelectFiledInfo[]) {
    orgs.forEach((orgSelectElement) => {
      const userSelectTitleElement = orgSelectElement?.element?.previousElementSibling
      const mentionMarka = document.createElement('a')
      mentionMarka.style.marginLeft = '5px'
      mentionMarka.innerText = '@all'
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

  function makeMentionMarkForGroupSelect(orgs: OrgSelectFiledInfo[]) {
    orgs.forEach((orgSelectElement) => {
      const userSelectTitleElement = orgSelectElement?.element?.previousElementSibling
      const mentionMarka = document.createElement('a')
      mentionMarka.style.marginLeft = '5px'
      mentionMarka.innerText = '@all'
      mentionMarka.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild
          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              addBatchMentionForGroup(lasteles, 'beforebegin', orgSelectElement)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                addBatchMentionForGroup(divbr, 'beforebegin', orgSelectElement)
              } else {
                addBatchMentionForGroup(lasteles, 'beforeend', orgSelectElement)
              }
            } else {
              addBatchMentionForGroup(replyInputArea, 'beforeend', orgSelectElement)
            }
          } else {
            addBatchMentionForGroup(replyInputArea, 'beforeend', orgSelectElement)
          }
          moveCursorToEnd(replyInputArea)
        }
      })
      userSelectTitleElement?.appendChild(mentionMarka)
    })
  }

  function makeMentionMarkForUserSelect(us: UserSelectFiledInfo[]) {
    us.forEach((userSelectElement) => {
      const userSelectTitleElement = userSelectElement?.element?.previousElementSibling
      const mentionMarka = document.createElement('a')
      mentionMarka.style.marginLeft = '5px'
      mentionMarka.innerText = '@all'
      mentionMarka.addEventListener('click', function () {
        ;(replyBox as HTMLElement)?.focus()
        const replyInputArea = isNoti
          ? (document.querySelector('iframe')?.contentDocument?.querySelector('.ocean-ui-editor-field') as HTMLElement)
          : (document.querySelector('.ocean-ui-editor-field') as HTMLElement)
        if (replyInputArea) {
          const lasteles = replyInputArea.lastElementChild
          if (lasteles) {
            if (lasteles.nodeName === 'BR') {
              addBatchMentionForUser(lasteles, 'beforebegin', userSelectElement)
            } else if (lasteles.nodeName === 'DIV') {
              const divbr = lasteles.lastElementChild
              if (divbr && divbr.nodeName === 'BR') {
                addBatchMentionForUser(divbr, 'beforebegin', userSelectElement)
              } else {
                addBatchMentionForUser(lasteles, 'beforeend', userSelectElement)
              }
            } else {
              addBatchMentionForUser(replyInputArea, 'beforeend', userSelectElement)
            }
          } else {
            addBatchMentionForUser(replyInputArea, 'beforeend', userSelectElement)
          }
          moveCursorToEnd(replyInputArea)
        }
      })
      userSelectTitleElement?.appendChild(mentionMarka)
    })
  }

  type UserSelectFiledInfo = {
    fieldcode: string
    value: { id?: string; code: string; name: string }[]
    element?: HTMLElement
  }
  async function getUserSelectElementByFieldType(record: any) {
    const pre: UserSelectFiledInfo[] = []
    for (const key in record) {
      if (record[key] && typeof record[key] === 'object') {
        // console.log(record[key])
        if (record[key].type === 'USER_SELECT') {
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
        item.value = await Promise.all(
          item.value.map(async (v) => {
            v.id = await getUserIdbyCode(v.code)
            console.log('vvv', v)

            return v
          }),
        )
        return item
      }),
    )
    return rt
  }

  type OrgSelectFiledInfo = {
    fieldcode: string
    value: { id?: string; code: string; name: string }[]
    element?: HTMLElement
  }
  async function getOrgSelectElementByFieldType(record: any) {
    const pre: OrgSelectFiledInfo[] = []
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
        item.value = await Promise.all(
          item.value.map(async (v) => {
            v.id = await getOrgIdbyCode(v.code)
            return v
          }),
        )
        return item
      }),
    )
    return rt
  }

  type GroupSelectFiledInfo = {
    fieldcode: string
    value: { id?: string; code: string; name: string }[]
    element?: HTMLElement
  }
  async function getGroupSelectElementByFieldType(record: any) {
    const pre: GroupSelectFiledInfo[] = []
    for (const key in record) {
      if (record[key] && typeof record[key] === 'object') {
        // console.log(record[key])
        if (record[key].type === 'GROUP_SELECT') {
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
        item.value = await Promise.all(
          item.value.map(async (v) => {
            v.id = await getGroupIdbyCode(v.code)
            return v
          }),
        )
        return item
      }),
    )
    return rt
  }

  function addBatchMentionForUser(lasteles: Element, position: InsertPosition, users: UserSelectFiledInfo) {
    for (const item of users.value) {
      lasteles.insertAdjacentHTML(position, stringFormat(appendUserStringFormat, item.code, item.id, item.name))
    }
  }

  function addMentionForOrg(
    lasteles: Element,
    position: InsertPosition,
    orgValue: { id?: string; code: string; name: string },
  ) {
    lasteles.insertAdjacentHTML(
      position,
      stringFormat(appendOrgStringFormat, orgValue.id, orgValue.code, orgValue.name),
    )
  }
  function addMentionForGroup(
    lasteles: Element,
    position: InsertPosition,
    orgValue: { id?: string; code: string; name: string },
  ) {
    lasteles.insertAdjacentHTML(
      position,
      stringFormat(appendGroupStringFormat, orgValue.id, orgValue.code, orgValue.name),
    )
  }

  function addBatchMentionForOrg(lasteles: Element, position: InsertPosition, orgs: OrgSelectFiledInfo) {
    for (const item of orgs.value) {
      addMentionForOrg(lasteles, position, item)
    }
  }
  function addBatchMentionForGroup(lasteles: Element, position: InsertPosition, orgs: OrgSelectFiledInfo) {
    for (const item of orgs.value) {
      addMentionForGroup(lasteles, position, item)
    }
  }

  async function getUserIdbyCode(code: string) {
    const myHeaders = new Headers()
    myHeaders.append('X-Requested-With', kintone.getRequestToken())
    myHeaders.append('Content-Type', 'text/plain')
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow' as RequestRedirect, // Update the type of redirect property
    }
    try {
      const response = await fetch(`/v1/users.json?codes[0]=${code}`, requestOptions)
      const result = await response.json()
      if (result.users.length === 0) {
        throw new Error('No user found')
      }
      return result.users[0].id
    } catch (error) {
      return ''
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
  async function getGroupIdbyCode(code: string) {
    const myHeaders = new Headers()
    myHeaders.append('X-Requested-With', kintone.getRequestToken())
    myHeaders.append('Content-Type', 'text/plain')
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow' as RequestRedirect, // Update the type of redirect property
    }
    try {
      const response = await fetch(`/v1/groups.json?codes[0]=${code}`, requestOptions)
      const result = await response.json()
      if (result.groups.length === 0) {
        throw new Error('No group found')
      }
      return result.groups[0].id
    } catch (error) {
      return ''
    }
  }

  async function processUserSelectField(record: any) {
    const us = await getUserSelectElementByFieldType(record)
    console.log('select user info', us)
    makeMentionMarkForUserSelect(us)
  }

  async function processOrgSelectField(record: any) {
    const os = await getOrgSelectElementByFieldType(record)
    console.log('orginfo', os)
    makeMentionMarkForOrgSelect(os)
    makeMentionMarkForOrgs(os)
  }
  async function processGroupSelectField(record: any) {
    const gs = await getGroupSelectElementByFieldType(record)
    console.log('orginfo', gs)
    makeMentionMarkForGroupSelect(gs)
    makeMentionMarkForGroups(gs)
  }

  kintone.events.on('app.record.detail.show', async function (event) {
    console.log('monkey jumping on detail.')
    init()
    processUserSelectField(event.record)
    processOrgSelectField(event.record)
    processGroupSelectField(event.record)
    // find all user mention and make mark
    makeAllUserMentionMark('@')
    return event
  })
}

export default app
