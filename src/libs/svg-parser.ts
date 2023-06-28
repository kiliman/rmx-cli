// @ts-nocheck
// https://github.com/jannicz/svg-icon-sprite/blob/master/scripts/svg-parser.lib.js

const fs = require('fs')
const path = require('path')

/**
 * Library for generating SVG sprites (using symbol technique)
 *
 * @author Jan Suwart
 * @licence MIT
 */
const svgParserLib = {
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgReset: '\x1b[0m',

  /**
   * @param {string} file - full path of current file
   * @param {string} name - name of current file
   * @return {string} the created symbol element as string
   */
  createSymbol: (file, name) => {
    if (!file || !name) {
      throw new Error('No file found at ' + name)
    } else if (!file.includes('<svg')) {
      throw new Error('No SVG node found in ' + name)
    }

    let symbolEl = file
      .replace(/<\?xml.*?\?>/, '')
      .replace(/ id=".*?"/, '')
      .replace(/ version=".*?"/, '')
      .replace(/ xmlns=".*?"/, '')
      .replace(/ xmlns:xlink=".*?"/, '')
      .replace('<svg', `<symbol id="${name}"`)
      .replace('</svg>', '</symbol>\n')

    return symbolEl
  },

  /**
   * Removes fill and stroke attributes while preserving fill="none" to allow hollow elements
   * @param {string} svg - input SVG as string
   * @return {string} stripped SVG as string
   */
  stripProperties: svg => {
    const strokeFill = /\s+(stroke|fill)="((?!(none|currentColor)).*?)"/gim
    const widthHeight = /\s+(width|height)=".*?"/gim
    return svg
      .replace(strokeFill, ' $1="currentColor"')
      .replace(widthHeight, '')
  },

  makeSolid: svg => {
    return svg.replace(/fill="none"/g, 'fill="currentColor"')
  },

  /**
   * Removes all whitespaces to reduce file size
   */
  removeWhitespaces: svg => {
    return svg
      .replace(/\n/g, '')
      .replace(/[\t ]+\</g, '<')
      .replace(/\>[\t ]+\</g, '><')
      .replace(/\>[\t ]+$/g, '>')
  },

  /**
   * Wraps the passed elements string into a SVG structure
   * @param {string} elements - concatenated symbols
   * @return {string}
   */
  wrapInSvgTag: elements => {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">\n${elements}</svg>\n`
  },

  /**
   * Iterates the file array, retrieves each file and applies lib functions
   * @param {{name: string, path: string}[]} files - List containing file references and names
   * @param {boolean} [strip] - whether to remove fill/stroke attributes
   * @param {boolean} [trim] - whether to remove all
   * @return {{elementsChanged: number, svgElement: string}} final SVG sprite as string
   */
  iterateFiles: (files, strip, trim) => {
    let svgElement = ''
    let elementsChanged = 0

    files.forEach(file => {
      let name = path.basename(file, '.svg')
      try {
        let svg = fs.readFileSync(file, 'utf8')
        let symbolEl = svgParserLib.createSymbol(svg, name)

        if (strip) {
          symbolEl = svgParserLib.stripProperties(symbolEl)
        }

        svgElement += symbolEl
        elementsChanged++
      } catch (e) {
        console.warn(
          svgParserLib.fgRed + 'Could not parse',
          name,
          'because of error:' + svgParserLib.fgReset,
          e.message,
          '- file skipped!',
        )
      }
    })

    if (trim) {
      svgElement = svgParserLib.removeWhitespaces(svgElement)
    }

    return { svgElement, elementsChanged }
  },

  readFile: fileObj => {
    return fs.readFileSync(fileObj.path, 'utf8')
  },

  /**
   * Writes the string into a folder
   * @param {string} fullFileName - folder and filename
   * @param {string} outputString - the output that should be written
   * @return {Promise} holding the write error if failed, true otherwise
   */
  writeIconsToFile: (fullFileName, outputString) => {
    fs.writeFileSync(fullFileName, outputString, 'utf8')
  },

  /**
   * Reads the directory and returns array of files that match filetype (i.e. .svg)
   * @param {string} dirname - full directory name relative to the working directory of the script
   * @param {string} filetype - substring that the file should be tested for, i.e. '.svg'
   * @return {Promise} containing the file list as array
   */
  readDirectory: (dirname, filetype) => {
    return new Promise((resolve, reject) => {
      let fileList = []

      fs.readdir(dirname, (error, files) => {
        if (error) {
          reject(error)
        } else {
          files.forEach(file => {
            if (file.includes(filetype)) {
              fileList.push(file)
            }
          })

          resolve(fileList)
        }
      })
    })
  },
}

module.exports = svgParserLib
